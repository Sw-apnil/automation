import type { FootballEvent } from "@/lib/events/types";

export function categorizeNews(title: string, description: string): FootballEvent["category"] {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("transfer") || text.includes("sign") || text.includes("bid") || text.includes("rumour") || text.includes("rumor")) {
    return "transfer";
  }
  if (text.includes("injury") || text.includes("injured")) return "injury";
  if (text.includes("lineup") || text.includes("squad")) return "squad";
  if (text.includes("quote") || text.includes("said")) return "quote";
  if (text.includes("academy") || text.includes("youth")) return "academy";
  if (text.includes("fixture") || text.includes("draw") || text.includes("schedule")) return "fixture";
  if (text.includes("result") || text.includes("win") || text.includes("beat")) return "result";
  if (text.includes("standing") || text.includes("table")) return "standing";
  return "team_news";
}

export function buildFootballNewsQuery(accountKeywords: string[], maxLength = 200) {
  const keywords = uniqueKeywords(accountKeywords.length > 0 ? accountKeywords : ["football"]);
  const terms: string[] = [];

  for (const keyword of keywords) {
    const candidate = [...terms, quoteTerm(keyword)].join(" OR ");
    if (candidate.length > maxLength) continue;
    terms.push(quoteTerm(keyword));
  }

  if (terms.length === 0) return "football";
  return terms.join(" OR ");
}

function uniqueKeywords(keywords: string[]) {
  const seen = new Set<string>();
  return keywords.filter((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function quoteTerm(keyword: string) {
  return `"${keyword.trim().replaceAll('"', "")}"`;
}
