import type { AccountConfig, FootballEvent } from "@/lib/events/types";

const categoryTags: Record<FootballEvent["category"], string[]> = {
  transfer: ["#TransferNews", "#DeadlineDay", "#HereWeGo"],
  fixture: ["#Matchday", "#Football"],
  result: ["#FullTime", "#Football"],
  standing: ["#LeagueTable", "#Football"],
  injury: ["#InjuryUpdate", "#Football"],
  squad: ["#SquadNews", "#Lineup"],
  team_news: ["#Football", "#TeamNews"],
  quote: ["#Football", "#Quotes"],
  academy: ["#Football", "#Academy"],
  contract: ["#Football", "#Contract", "#Transfers"],
  manager: ["#Football", "#Manager"],
  official_statement: ["#Football", "#Official"],
  tournament_news: ["#Football", "#Tournament"],
  engagement: [],
  opinion: ["#Football"],
  meme: [],
  other: ["#Football"]
};

export function generateHashtags(event: FootballEvent, account: AccountConfig): string[] {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
  const tags = new Set<string>();

  for (const tag of rotate(account.hashtags, event.id).slice(0, 2)) tags.add(tag);
  for (const tag of rotate(categoryTags[event.category] ?? [], event.id).slice(0, 2)) tags.add(tag);

  for (const keyword of account.keywords) {
    const normalized = keyword.replace(/[^a-zA-Z0-9]/g, "");
    if (normalized && text.includes(keyword.toLowerCase())) tags.add(`#${normalized}`);
  }

  return [...tags].slice(0, 5);
}

function rotate(values: string[], seed: string) {
  if (values.length === 0) return [];
  const offset = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}
