import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Channel = Database["public"]["Tables"]["channels"]["Row"];

export async function listChannels(): Promise<Channel[]> {
  const user = await requireUser();
  const client = await createClient();
  const { data, error } = await client
    .from("channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new DataAccessError("Channels could not be loaded.", error);
  }

  return data;
}
