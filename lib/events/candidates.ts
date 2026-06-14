import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { normalizeHeadline } from "@/lib/events/dedupe";
import { selectImageUrl } from "@/lib/images/select-image";

const categoryImportance: Record<FootballEvent["category"], number> = {
  transfer: 10,
  result: 10,
  injury: 8,
  fixture: 8,
  squad: 7,
  quote: 7,
  standing: 7,
  team_news: 6,
  academy: 3,
  contract: 9,
  manager: 9,
  official_statement: 8,
  tournament_news: 8,
  engagement: 0,
  opinion: 2,
  meme: 0,
  other: 4
};

export type CandidateEvent = FootballEvent & {
  score: number;
  keywordMatchStrength: number;
  candidateScore: number;
};

export function selectBestCandidates(
  events: Array<FootballEvent & { score: number }>,
  account: AccountConfig
): CandidateEvent[] {
  const ranked = events
    .map((event) => {
      const keywordMatchStrength = scoreKeywordMatch(event, account);
      return {
        ...event,
        keywordMatchStrength,
        candidateScore: candidateScore(event, account, keywordMatchStrength)
      };
    })
    .sort((a, b) => {
      if (b.candidateScore !== a.candidateScore) return b.candidateScore - a.candidateScore;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const selected: CandidateEvent[] = [];
  for (const event of ranked) {
    if (selected.some((existing) => headlineSimilarity(existing.title, event.title) >= 0.84)) continue;
    selected.push(event);
    if (selected.length >= account.maxPostsPerRun) break;
  }
  return selected;
}

export function scoreKeywordMatch(event: FootballEvent, account: AccountConfig) {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
  return account.keywords.reduce((matches, keyword) => {
    return text.includes(keyword.toLowerCase()) ? matches + 1 : matches;
  }, 0);
}

function candidateScore(event: FootballEvent & { score: number }, account: AccountConfig, keywordMatchStrength: number) {
  const imageBoost = selectImageUrl(event, account) ? 1 : 0;
  const recencyBoost = recencyScore(event.publishedAt);
  const categoryBoost = categoryImportance[event.category] / 10;
  return event.score * 10 + keywordMatchStrength * 3 + imageBoost * 2 + recencyBoost + categoryBoost;
}

function recencyScore(publishedAt: string) {
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 3_600_000);
  if (ageHours <= 1) return 5;
  if (ageHours <= 6) return 3;
  if (ageHours <= 24) return 1;
  return 0;
}

function headlineSimilarity(a: string, b: string) {
  const aTokens = new Set(normalizeHeadline(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeHeadline(b).split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}
