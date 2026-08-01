import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/logger";
import type { Database, Json } from "@/types/database";

type ServerClient = SupabaseClient<Database>;

export async function recordAutomationLog(
  client: ServerClient,
  userId: string,
  event: string,
  message: string,
  metadata: Json = {},
): Promise<void> {
  const { error } = await client.from("automation_logs").insert({
    user_id: userId,
    level: "info",
    event,
    message,
    metadata,
  });

  if (error) {
    logServerError("Unable to persist activity log", error, { event, userId });
  }
}
