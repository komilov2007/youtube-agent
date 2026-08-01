"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { invalidActionResult } from "@/lib/validation/action-result";
import type { ActionResult } from "@/types/actions";

import { recordAutomationLog } from "../logs/write";
import { settingsSchema } from "./schema";

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return invalidActionResult(parsed.error);
  }

  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      message: "Your session expired. Sign in and try again.",
    };
  }

  const client = await createClient();
  const { error } = await client.rpc("update_my_settings", {
    p_full_name: parsed.data.fullName,
    p_timezone: parsed.data.timezone,
    p_language: parsed.data.language,
    p_daily_publish_limit: parsed.data.dailyPublishLimit,
    p_automation_enabled: parsed.data.automationEnabled,
  });
  if (error) {
    logServerError("Settings update failed", error, { userId: user.id });
    return {
      ok: false,
      message: "Settings could not be saved. Please try again.",
    };
  }

  await recordAutomationLog(
    client,
    user.id,
    "settings.updated",
    "Application settings were updated.",
  );
  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { ok: true, message: "Settings saved.", data: null };
}
