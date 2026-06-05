import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { cachedJson } from "@/lib/db/cache";
import type { SourceAdapter } from "@/lib/sources/source";

type NewsApiResponse = {
  articles?: {
    title?: string;
    description?: string;
    url?: string;
    urlToImage?: string;
    publishedAt?: string;
    source?: { name?: string };
  }[];
};

export class NewsApiAdapter implements SourceAdapter {
  name = "newsapi" as const;

  async fetch(account: AccountConfig): Promise<FootballEvent[]> {
    const apiKey = account.newsApiKey;
    if (!apiKey) return [];
    const query = account.keywords.map((keyword) => `"${keyword}"`).join(" OR ");
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", `${query} football`);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("apiKey", apiKey);

    const payload = await cachedJson<NewsApiResponse>(`newsapi:${account.slug}`, 900, async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`NewsAPI failed: ${response.status} ${await response.text()}`);
      return response.json() as Promise<NewsApiResponse>;
    });

    return (payload.articles ?? [])
      .filter((article) => article.title && article.publishedAt)
      .map((article) => ({
        id: article.url ?? `${article.title}-${article.publishedAt}`,
        title: article.title ?? "",
        description: article.description ?? null,
        imageUrl: article.urlToImage ?? null,
        source: this.name,
        sourceUrl: article.url ?? null,
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        category: categorizeNews(article.title ?? "", article.description ?? ""),
        accountId: account.id,
        metadata: { provider: article.source?.name }
      }));
  }
}

function categorizeNews(title: string, description: string): FootballEvent["category"] {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("transfer") || text.includes("sign") || text.includes("bid")) return "transfer";
  if (text.includes("injury") || text.includes("injured")) return "injury";
  if (text.includes("lineup") || text.includes("squad")) return "squad";
  if (text.includes("quote") || text.includes("said")) return "quote";
  if (text.includes("academy") || text.includes("youth")) return "academy";
  return "team_news";
}
