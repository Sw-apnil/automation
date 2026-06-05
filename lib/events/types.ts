export type EventCategory =
  | "transfer"
  | "fixture"
  | "result"
  | "standing"
  | "injury"
  | "squad"
  | "team_news"
  | "quote"
  | "academy"
  | "other";

export type FootballEvent = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  source: "api-football" | "newsapi";
  sourceUrl?: string | null;
  publishedAt: string;
  category: EventCategory;
  accountId?: string;
  metadata?: Record<string, unknown>;
};

export type AccountConfig = {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
  hashtags: string[];
  style: string;
  characterLimit: number;
  relevanceThreshold: number;
  maxPostsPerRun: number;
  enabled: boolean;
  groqApiKey?: string | null;
  groqModel?: string | null;
  groqTemperature: number;
  groqMaxTokens: number;
  bufferAccessToken?: string | null;
  bufferChannelIds: string[];
  platforms: string[];
  scheduleIntervalMinutes: number;
  scheduleTimeSlots: string[];
  lastRunAt?: string | null;
  newsApiKey?: string | null;
  apiFootballKey?: string | null;
  teamId?: number | null;
  leagueId?: number | null;
  logoUrl?: string | null;
  promptTemplate?: string | null;
};

export type QueuedPost = {
  id: string;
  account_id: string;
  event_id: string;
  content: string;
  hashtags: string[];
  image_url: string | null;
  status: "pending" | "publishing" | "published" | "failed" | "skipped";
};
