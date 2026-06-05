import type { AccountConfig, FootballEvent } from "@/lib/events/types";

export interface SourceAdapter {
  name: FootballEvent["source"];
  fetch(account: AccountConfig): Promise<FootballEvent[]>;
}
