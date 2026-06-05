import type { AccountConfig, FootballEvent } from "@/lib/events/types";

const categoryWeights: Record<FootballEvent["category"], number> = {
  transfer: 10,
  result: 10,
  fixture: 8,
  standing: 7,
  injury: 8,
  squad: 7,
  team_news: 6,
  quote: 7,
  academy: 3,
  other: 4
};

const starTerms = ["mbappe", "bellingham", "vinicius", "haaland", "messi", "ronaldo", "yamal", "saka", "odegaard"];
const competitionTerms = ["champions league", "ucl", "world cup", "fifa world cup"];

export function scoreEvent(event: FootballEvent, account: AccountConfig): number {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
  let score = categoryWeights[event.category] ?? 4;

  if (account.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) score += 1;
  if (starTerms.some((term) => text.includes(term))) score = Math.max(score, 9);
  if (competitionTerms.some((term) => text.includes(term))) score = Math.max(score, 10);
  if (text.includes("confirmed") || text.includes("official")) score += 1;

  return Math.max(0, Math.min(10, score));
}
