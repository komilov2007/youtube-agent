import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AutomationLog =
  Database["public"]["Tables"]["automation_logs"]["Row"];
export const logLevels = ["all", "debug", "info", "warning", "error"] as const;
export type LogLevelFilter = (typeof logLevels)[number];

export function isLogLevelFilter(
  value: string | undefined,
): value is LogLevelFilter {
  return logLevels.includes((value ?? "") as LogLevelFilter);
}

export async function listAutomationLogs(
  level: LogLevelFilter = "all",
): Promise<AutomationLog[]> {
  const user = await requireUser();
  const client = await createClient();
  let query = client
    .from("automation_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (level !== "all") {
    query = query.eq("level", level);
  }

  const { data, error } = await query;
  if (error) {
    throw new DataAccessError("Automation logs could not be loaded.", error);
  }

  return data;
}
