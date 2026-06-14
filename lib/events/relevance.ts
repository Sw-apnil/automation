import type { AccountConfig, EventCategory, FootballEvent, RelevanceRules } from "@/lib/events/types";

const defaultCategoryWeights: Record<EventCategory, number> = {
  transfer: 10,
  result: 10,
  fixture: 8,
  standing: 7,
  injury: 8,
  squad: 7,
  team_news: 6,
  quote: 7,
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

export function scoreEvent(event: FootballEvent, account: AccountConfig): number {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
  const rules = account.relevanceRules ?? {};
  const categoryWeights = rules.categoryWeights ?? {};
  let score = numericRule(categoryWeights[event.category], defaultCategoryWeights[event.category] ?? 4);

  const keywordBoost = numericRule(rules.keywordBoost, 1);
  const keywordBoosts = rules.keywordBoosts ?? {};
  for (const keyword of account.keywords) {
    if (!contains(text, keyword)) continue;
    score += numericRule(keywordBoosts[keyword], keywordBoost);
  }

  for (const termRule of validTermRules(rules)) {
    if (contains(text, termRule.term)) score = Math.max(score, termRule.score);
  }

  for (const phraseRule of validPhraseRules(rules)) {
    if (contains(text, phraseRule.phrase)) score += phraseRule.boost;
  }

  return Math.max(0, Math.min(10, score));
}

function contains(text: string, phrase: string) {
  return text.includes(phrase.trim().toLowerCase());
}

function numericRule(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function validTermRules(rules: RelevanceRules) {
  return (rules.terms ?? []).filter(
    (rule): rule is { term: string; score: number } =>
      typeof rule.term === "string" && rule.term.trim().length > 0 && typeof rule.score === "number" && Number.isFinite(rule.score)
  );
}

function validPhraseRules(rules: RelevanceRules) {
  return (rules.phraseBoosts ?? []).filter(
    (rule): rule is { phrase: string; boost: number } =>
      typeof rule.phrase === "string" && rule.phrase.trim().length > 0 && typeof rule.boost === "number" && Number.isFinite(rule.boost)
  );
}
