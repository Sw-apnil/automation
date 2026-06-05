import { getServiceSupabase } from "@/lib/db/supabase";

export async function cachedJson<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("api_cache")
    .select("payload")
    .eq("cache_key", key)
    .gt("expires_at", now)
    .maybeSingle();

  if (data?.payload) return data.payload as T;

  const payload = await loader();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await supabase.from("api_cache").upsert({
    cache_key: key,
    payload,
    expires_at: expiresAt
  });
  return payload;
}
