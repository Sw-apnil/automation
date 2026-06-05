import { env, requireEnv } from "@/lib/config/env";
import { randomUUID } from "crypto";

export async function publishToBuffer(input: {
  profileId: string;
  text: string;
  imageUrl?: string | null;
}): Promise<{ postId: string }> {
  if (!env.BUFFER_ACCESS_TOKEN) {
    return { postId: `dry-run-${randomUUID()}` };
  }

  const body = new URLSearchParams();
  body.set("profile_ids[]", input.profileId);
  body.set("text", input.text);
  body.set("now", "true");
  if (input.imageUrl) body.set("media[photo]", input.imageUrl);

  const response = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("BUFFER_ACCESS_TOKEN")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) throw new Error(`Buffer failed: ${response.status} ${await response.text()}`);
  const payload = (await response.json()) as { updates?: { id: string }[] };
  return { postId: payload.updates?.[0]?.id ?? randomUUID() };
}
