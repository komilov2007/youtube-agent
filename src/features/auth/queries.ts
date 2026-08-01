import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

function getMetadataValue(
  metadata: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export async function getDashboardIdentity() {
  const user = await requireUser();
  const client = await createClient();
  const { data: profile, error } = await client
    .from("profiles")
    .select("full_name,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new DataAccessError("Account details could not be loaded.", error);
  }

  const metadata = user.user_metadata as Record<string, unknown>;
  return {
    name: profile
      ? profile.full_name
      : getMetadataValue(metadata, ["full_name", "name"]),
    email: user.email ?? "Authenticated account",
    avatarUrl: profile
      ? profile.avatar_url
      : getMetadataValue(metadata, ["avatar_url", "picture"]),
  };
}
