import type { AccountConfig, FootballEvent } from "@/lib/events/types";

export function scoreEvent(event: FootballEvent, account: AccountConfig): number {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
  const rules = account.relevanceRules;
  let score = rules.categoryWeights[event.category] ?? 4;

  for (const keyword of account.keywords) {
    if (!text.includes(keyword.toLowerCase())) continue;
    score += rules.keywordBoosts[keyword] ?? rules.keywordBoost;
  }

  for (const rule of rules.terms) {
    if (text.includes(rule.term.toLowerCase())) score = Math.max(score, rule.score);
  }

  for (const rule of rules.phraseBoosts) {
    if (text.includes(rule.phrase.toLowerCase())) score += rule.boost;
  }

  return Math.max(0, Math.min(10, score));
}
