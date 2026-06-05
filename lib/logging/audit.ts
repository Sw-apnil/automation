import { getServiceSupabase } from "@/lib/db/supabase";

type AuditLevel = "info" | "warning" | "error";

export async function auditLog(input: {
  accountId?: string | null;
  level?: AuditLevel;
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = getServiceSupabase();
    await supabase.from("audit_logs").insert({
      account_id: input.accountId ?? null,
      level: input.level ?? "info",
      event_type: input.eventType,
      message: input.message,
      metadata: input.metadata ?? {}
    });
  } catch (error) {
    console.error("auditLog failed", error);
  }
}
