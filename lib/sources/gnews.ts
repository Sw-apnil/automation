import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { cachedJson } from "@/lib/db/cache";
import { buildFootballNewsQuery, categorizeNews } from "@/lib/sources/news-utils";
import type { SourceAdapter } from "@/lib/sources/source";

type GNewsResponse = {
  articles?: {
    title?: string;
    description?: string;
    content?: string;
    url?: string;
    image?: string;
    publishedAt?: string;
    source?: { name?: string; url?: string };
  }[];
};

export class GNewsAdapter implements SourceAdapter {
  name = "gnews" as const;

  async fetch(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.gnewsEnabled || !account.gnewsApiKey) return [];

    const url = new URL("https://gnews.io/api/v4/search");
    url.searchParams.set("q", buildFootballNewsQuery(account.keywords, 200));
    url.searchParams.set("lang", "en");
    url.searchParams.set("max", "10");
    url.searchParams.set("apikey", account.gnewsApiKey);

    const payload = await cachedJson<GNewsResponse>(`gnews:${account.slug}:${hashQuery(url.searchParams.get("q") ?? "")}`, 900, async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GNews failed: ${response.status} ${await response.text()}`);
      return response.json() as Promise<GNewsResponse>;
    });

    return (payload.articles ?? [])
      .filter((article) => article.title && article.publishedAt)
      .map((article) => ({
        id: article.url ?? `${article.title}-${article.publishedAt}`,
        title: cleanTitle(article.title ?? ""),
        description: article.description ?? article.content ?? null,
        imageUrl: article.image ?? null,
        source: this.name,
        sourceUrl: article.url ?? null,
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        category: categorizeNews(article.title ?? "", article.description ?? article.content ?? ""),
        accountId: account.id,
        metadata: { provider: article.source?.name, providerUrl: article.source?.url }
      }));
  }
}

function cleanTitle(title: string) {
  return title.replace(/\s+-\s+[^-]+$/g, "").trim();
}

function hashQuery(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(31, hash) + value.charCodeAt(index);
  return Math.abs(hash).toString(36);
}
