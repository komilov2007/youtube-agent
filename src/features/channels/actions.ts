"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { invalidActionResult } from "@/lib/validation/action-result";
import type { ActionResult } from "@/types/actions";

import { channelSchema } from "./schema";
import { recordAutomationLog } from "../logs/write";

export async function createChannel(input: unknown): Promise<ActionResult> {
  const parsed = channelSchema.safeParse(input);
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
  const { data, error } = await client
    .from("channels")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      platform: parsed.data.platform,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    logServerError("Channel creation failed", error, { userId: user.id });
    return {
      ok: false,
      message: "The channel record could not be created. Please try again.",
    };
  }

  await recordAutomationLog(
    client,
    user.id,
    "channel.created",
    "A channel record was created.",
    {
      channel_id: data.id,
    },
  );
  revalidatePath("/channels");
  revalidatePath("/dashboard");

  return { ok: true, message: "Channel record created.", data: null };
}
