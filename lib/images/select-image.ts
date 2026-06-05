import type { AccountConfig, FootballEvent } from "@/lib/events/types";

export function selectImageUrl(event: FootballEvent, account: AccountConfig): string | null {
  if (event.imageUrl) return event.imageUrl;
  const playerPhoto = getNestedString(event.metadata, ["player", "photo"]);
  if (playerPhoto) return playerPhoto;
  const teamLogo = getNestedString(event.metadata, ["team", "logo"]);
  if (teamLogo) return teamLogo;
  return account.logoUrl ?? null;
}

function getNestedString(value: unknown, path: string[]): string | null {
  let cursor: unknown = value;
  for (const key of path) {
    if (!cursor || typeof cursor !== "object" || !(key in cursor)) return null;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return typeof cursor === "string" && cursor.length > 0 ? cursor : null;
}
