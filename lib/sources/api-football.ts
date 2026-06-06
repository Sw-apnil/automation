import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { cachedJson } from "@/lib/db/cache";
import type { SourceAdapter } from "@/lib/sources/source";

type ApiFootballEnvelope<T> = { response?: T[] };

export class ApiFootballAdapter implements SourceAdapter {
  name = "api-football" as const;

  async fetch(account: AccountConfig): Promise<FootballEvent[]> {
    if (!this.apiKey(account)) return [];
    const [fixtures, injuries, standings, transfers, squad] = await Promise.all([
      this.fetchFixtures(account),
      this.fetchInjuries(account),
      this.fetchStandings(account),
      this.fetchTransfers(account),
      this.fetchSquad(account)
    ]);
    return [...fixtures, ...injuries, ...standings, ...transfers, ...squad];
  }

  private async request<T>(account: AccountConfig, path: string, cacheKey: string, ttlSeconds: number): Promise<ApiFootballEnvelope<T>> {
    const url = new URL(`https://v3.football.api-sports.io/${path}`);
    const apiKey = this.apiKey(account);
    if (!apiKey) return {};
    return cachedJson<ApiFootballEnvelope<T>>(cacheKey, ttlSeconds, async () => {
      const response = await fetch(url, {
        headers: { "x-apisports-key": apiKey }
      });
      if (!response.ok) throw new Error(`API-Football failed: ${response.status} ${await response.text()}`);
      return response.json() as Promise<ApiFootballEnvelope<T>>;
    });
  }

  private apiKey(account: AccountConfig) {
    return account.apiFootballKey;
  }

  private async fetchFixtures(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.teamId && !account.leagueId) return [];
    const season = new Date().getUTCFullYear();
    const scope = account.teamId ? `team=${account.teamId}` : `league=${account.leagueId}`;
    const [recent, upcoming] = await Promise.all([
      this.request<FixtureRow>(
        account,
        `fixtures?${scope}&season=${season}&last=10`,
        `api-football:fixtures:recent:${account.slug}:${season}`,
        900
      ),
      this.request<FixtureRow>(
        account,
        `fixtures?${scope}&season=${season}&next=10`,
        `api-football:fixtures:upcoming:${account.slug}:${season}`,
        900
      )
    ]);

    const fixtures = new Map<number, FixtureRow>();
    for (const row of [...(recent.response ?? []), ...(upcoming.response ?? [])]) {
      fixtures.set(row.fixture.id, row);
    }

    return [...fixtures.values()].map((row) => {
      const status = row.fixture.status.short;
      const isResult = ["FT", "AET", "PEN"].includes(status);
      const home = row.teams.home.name;
      const away = row.teams.away.name;
      const score = `${row.goals.home ?? "-"}-${row.goals.away ?? "-"}`;
      return {
        id: `fixture:${row.fixture.id}:${status}`,
        title: isResult ? `${home} ${score} ${away}` : `${home} vs ${away}`,
        description: `${row.league.name} fixture status: ${row.fixture.status.long}`,
        imageUrl: row.teams.home.logo ?? row.teams.away.logo ?? account.logoUrl ?? null,
        source: this.name,
        publishedAt: row.fixture.date,
        category: isResult ? "result" : "fixture",
        accountId: account.id,
        metadata: row as unknown as Record<string, unknown>
      };
    });
  }

  private async fetchInjuries(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.teamId) return [];
    const season = new Date().getUTCFullYear();
    const payload = await this.request<InjuryRow>(
      account,
      `injuries?team=${account.teamId}&season=${season}`,
      `api-football:injuries:${account.slug}:${season}`,
      1800
    );
    return (payload.response ?? []).slice(0, 20).map((row) => ({
      id: `injury:${row.player.id}:${row.fixture.id}`,
      title: `${row.player.name} injury update`,
      description: row.player.reason ?? "Injury update",
      imageUrl: row.player.photo ?? account.logoUrl ?? null,
      source: this.name,
      publishedAt: row.fixture.date,
      category: "injury",
      accountId: account.id,
      metadata: row as unknown as Record<string, unknown>
    }));
  }

  private async fetchStandings(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.leagueId) return [];
    const season = new Date().getUTCFullYear();
    const payload = await this.request<StandingEnvelope>(
      account,
      `standings?league=${account.leagueId}&season=${season}`,
      `api-football:standings:${account.slug}:${season}`,
      21600
    );
    return (payload.response ?? []).flatMap((league) =>
      (league.league.standings?.[0] ?? [])
        .filter((standing) => account.teamId == null || standing.team.id === account.teamId)
        .map((standing) => ({
          id: `standing:${league.league.id}:${standing.team.id}:${standing.rank}`,
          title: `${standing.team.name} are ${ordinal(standing.rank)} in ${league.league.name}`,
          description: `${standing.points} points after ${standing.all.played} matches`,
          imageUrl: standing.team.logo ?? account.logoUrl ?? null,
          source: this.name,
          publishedAt: new Date().toISOString(),
          category: "standing" as const,
          accountId: account.id,
          metadata: standing as unknown as Record<string, unknown>
        }))
    );
  }

  private async fetchTransfers(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.teamId) return [];
    const payload = await this.request<TransferRow>(
      account,
      `transfers?team=${account.teamId}`,
      `api-football:transfers:${account.slug}`,
      3600
    );
    return (payload.response ?? []).slice(0, 20).flatMap((row) =>
      (row.transfers ?? []).map((transfer) => ({
        id: `transfer:${row.player.id}:${transfer.date}:${transfer.teams.in?.id ?? transfer.teams.out?.id}`,
        title: `${row.player.name} transfer update`,
        description: `${transfer.type ?? "Transfer"}: ${transfer.teams.out?.name ?? "Unknown"} to ${transfer.teams.in?.name ?? "Unknown"}`,
        imageUrl: row.player.photo ?? transfer.teams.in?.logo ?? account.logoUrl ?? null,
        source: this.name,
        publishedAt: transfer.date,
        category: "transfer" as const,
        accountId: account.id,
        metadata: { player: row.player, transfer }
      }))
    );
  }

  private async fetchSquad(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.teamId) return [];
    const payload = await this.request<SquadRow>(
      account,
      `players/squads?team=${account.teamId}`,
      `api-football:squad:${account.slug}`,
      21600
    );
    return (payload.response ?? []).map((row) => ({
      id: `squad:${row.team.id}:${row.players.length}`,
      title: `${row.team.name} squad update`,
      description: `${row.players.length} registered players in the latest squad data`,
      imageUrl: row.team.logo ?? account.logoUrl ?? row.players.find((player) => player.photo)?.photo ?? null,
      source: this.name,
      publishedAt: new Date().toISOString(),
      category: "squad" as const,
      accountId: account.id,
      metadata: row as unknown as Record<string, unknown>
    }));
  }
}

type FixtureRow = {
  fixture: { id: number; date: string; status: { short: string; long: string } };
  league: { name: string };
  teams: { home: { name: string; logo?: string }; away: { name: string; logo?: string } };
  goals: { home: number | null; away: number | null };
};

type InjuryRow = {
  player: { id: number; name: string; photo?: string; reason?: string };
  fixture: { id: number; date: string };
};

type StandingEnvelope = {
  league: {
    id: number;
    name: string;
    standings?: {
      rank: number;
      points: number;
      team: { id: number; name: string; logo?: string };
      all: { played: number };
    }[][];
  };
};

type TransferRow = {
  player: { id: number; name: string; photo?: string };
  transfers?: {
    date: string;
    type?: string;
    teams: { in?: { id: number; name: string; logo?: string }; out?: { id: number; name: string; logo?: string } };
  }[];
};

type SquadRow = {
  team: { id: number; name: string; logo?: string };
  players: { id: number; name: string; age?: number; number?: number; position?: string; photo?: string }[];
};

function ordinal(value: number) {
  const suffix = ["th", "st", "nd", "rd"][(value % 100 > 10 && value % 100 < 14) ? 0 : value % 10] ?? "th";
  return `${value}${suffix}`;
}
