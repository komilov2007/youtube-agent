import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AutomationLog = Database["public"]["Tables"]["automation_logs"]["Row"];

export type DashboardSummary = {
  channels: number;
  queued: number;
  published: number;
  failed: number;
  automationEnabled: boolean;
  recentActivity: AutomationLog[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await requireUser();
  const client = await createClient();

  const [channels, queued, published, failed, activity, settings] =
    await Promise.all([
      client
        .from("channels")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      client
        .from("content_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", [
          "draft",
          "pending_approval",
          "approved",
          "scheduled",
          "publishing",
        ]),
      client
        .from("content_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "published"),
      client
        .from("content_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "failed"),
      client
        .from("automation_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6),
      client
        .from("app_settings")
        .select("automation_enabled")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const firstError =
    channels.error ??
    queued.error ??
    published.error ??
    failed.error ??
    activity.error ??
    settings.error;

  if (firstError) {
    throw new DataAccessError(
      "Dashboard data could not be loaded.",
      firstError,
    );
  }

  return {
    channels: channels.count ?? 0,
    queued: queued.count ?? 0,
    published: published.count ?? 0,
    failed: failed.count ?? 0,
    automationEnabled: settings.data?.automation_enabled ?? false,
    recentActivity: activity.data ?? [],
  };
}
