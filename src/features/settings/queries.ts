import "server-only";

import { requireUser } from "@/lib/auth/user";
import { DataAccessError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export type SettingsView = {
  email: string;
  fullName: string;
  timezone: string;
  language: "en" | "uz" | "ru";
  dailyPublishLimit: number;
  automationEnabled: boolean;
};

export async function getSettings(): Promise<SettingsView> {
  const user = await requireUser();
  const client = await createClient();
  const [profile, settings] = await Promise.all([
    client
      .from("profiles")
      .select("full_name,email")
      .eq("id", user.id)
      .maybeSingle(),
    client
      .from("app_settings")
      .select("timezone,language,daily_publish_limit,automation_enabled")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const firstError = profile.error ?? settings.error;
  if (firstError) {
    throw new DataAccessError("Settings could not be loaded.", firstError);
  }

  const language = settings.data?.language;

  return {
    email: profile.data?.email ?? user.email ?? "",
    fullName: profile.data?.full_name ?? "",
    timezone: settings.data?.timezone ?? "UTC",
    language: language === "uz" || language === "ru" ? language : "en",
    dailyPublishLimit: settings.data?.daily_publish_limit ?? 1,
    automationEnabled: settings.data?.automation_enabled ?? false,
  };
}

export async function getUserTimeZone(): Promise<string> {
  const user = await requireUser();
  const client = await createClient();
  const { data, error } = await client
    .from("app_settings")
    .select("timezone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new DataAccessError(
      "Timezone preference could not be loaded.",
      error,
    );
  }

  return data?.timezone ?? "UTC";
}
