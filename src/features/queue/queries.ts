import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ContentItemRow = Database["public"]["Tables"]["content_items"]["Row"];

export type QueueItem = ContentItemRow & {
  channelName: string | null;
  sourceName: string | null;
};

export const queueStatuses = [
  "all",
  "draft",
  "pending_approval",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
] as const;

export type QueueStatusFilter = (typeof queueStatuses)[number];

export function isQueueStatusFilter(
  value: string | undefined,
): value is QueueStatusFilter {
  return queueStatuses.includes((value ?? "") as QueueStatusFilter);
}

export async function listQueueItems(
  status: QueueStatusFilter = "all",
): Promise<QueueItem[]> {
  const user = await requireUser();
  const client = await createClient();

  let itemsQuery = client
    .from("content_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    itemsQuery = itemsQuery.eq("status", status);
  }

  const [itemsResult, channelsResult, sourcesResult] = await Promise.all([
    itemsQuery,
    client.from("channels").select("id,name").eq("user_id", user.id),
    client.from("content_sources").select("id,name").eq("user_id", user.id),
  ]);

  const firstError =
    itemsResult.error ?? channelsResult.error ?? sourcesResult.error;
  if (firstError) {
    throw new DataAccessError(
      "Publishing queue could not be loaded.",
      firstError,
    );
  }

  const channelNames = new Map(
    (channelsResult.data ?? []).map((row) => [row.id, row.name]),
  );
  const sourceNames = new Map(
    (sourcesResult.data ?? []).map((row) => [row.id, row.name]),
  );

  return (itemsResult.data ?? []).map((item) => ({
    ...item,
    channelName: item.channel_id
      ? (channelNames.get(item.channel_id) ?? null)
      : null,
    sourceName: item.source_id
      ? (sourceNames.get(item.source_id) ?? null)
      : null,
  }));
}
