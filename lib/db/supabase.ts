import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/config/env";

export function getServiceSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });
}

export function getAnonSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false }
  });
}
