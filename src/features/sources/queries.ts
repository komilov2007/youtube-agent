import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ContentSource =
  Database["public"]["Tables"]["content_sources"]["Row"];

export async function listContentSources(): Promise<ContentSource[]> {
  const user = await requireUser();
  const client = await createClient();
  const { data, error } = await client
    .from("content_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new DataAccessError("Content sources could not be loaded.", error);
  }

  return data;
}
