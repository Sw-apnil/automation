import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { cachedJson } from "@/lib/db/cache";
import { buildFootballNewsQuery, categorizeNews } from "@/lib/sources/news-utils";
import type { SourceAdapter } from "@/lib/sources/source";

type GuardianResponse = {
  response?: {
    results?: {
      id?: string;
      webTitle?: string;
      webUrl?: string;
      webPublicationDate?: string;
      fields?: {
        headline?: string;
        trailText?: string;
        thumbnail?: string;
      };
    }[];
  };
};

export class GuardianAdapter implements SourceAdapter {
  name = "guardian" as const;

  async fetch(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.guardianEnabled || !account.guardianApiKey) return [];

    const url = new URL("https://content.guardianapis.com/search");
    url.searchParams.set("q", buildFootballNewsQuery(account.keywords, 500));
    url.searchParams.set("section", "football");
    url.searchParams.set("show-fields", "trailText,thumbnail,headline");
    url.searchParams.set("order-by", "newest");
    url.searchParams.set("page-size", "10");
    url.searchParams.set("api-key", account.guardianApiKey);

    const payload = await cachedJson<GuardianResponse>(`guardian:${account.slug}:${hashQuery(url.searchParams.get("q") ?? "")}`, 1800, async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Guardian failed: ${response.status} ${await response.text()}`);
      return response.json() as Promise<GuardianResponse>;
    });

    return (payload.response?.results ?? [])
      .filter((article) => article.webTitle && article.webPublicationDate)
      .map((article) => {
        const title = article.fields?.headline ?? article.webTitle ?? "";
        const description = stripHtml(article.fields?.trailText ?? "");
        return {
          id: article.id ?? article.webUrl ?? `${title}-${article.webPublicationDate}`,
          title,
          description: description || null,
          imageUrl: article.fields?.thumbnail ?? null,
          source: this.name,
          sourceUrl: article.webUrl ?? null,
          publishedAt: article.webPublicationDate ?? new Date().toISOString(),
          category: categorizeNews(title, description),
          accountId: account.id,
          metadata: { provider: "The Guardian" }
        };
      });
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}

function hashQuery(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(31, hash) + value.charCodeAt(index);
  return Math.abs(hash).toString(36);
}
