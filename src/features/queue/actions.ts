"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { invalidActionResult } from "@/lib/validation/action-result";
import type { ActionResult } from "@/types/actions";

import { recordAutomationLog } from "../logs/write";
import { contentItemSchema } from "./schema";

export async function createContentItem(input: unknown): Promise<ActionResult> {
  const parsed = contentItemSchema.safeParse(input);
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

  if (parsed.data.channelId) {
    const { data, error } = await client
      .from("channels")
      .select("id")
      .eq("id", parsed.data.channelId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logServerError("Channel ownership check failed", error, {
        userId: user.id,
      });
      return {
        ok: false,
        message: "The destination channel could not be verified.",
      };
    }
    if (!data) {
      return {
        ok: false,
        message: "Review the highlighted fields and try again.",
        fieldErrors: { channelId: ["Select one of your own channels."] },
      };
    }
  }

  if (parsed.data.sourceId) {
    const { data, error } = await client
      .from("content_sources")
      .select("id")
      .eq("id", parsed.data.sourceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logServerError("Source ownership check failed", error, {
        userId: user.id,
      });
      return {
        ok: false,
        message: "The content source could not be verified.",
      };
    }
    if (!data) {
      return {
        ok: false,
        message: "Review the highlighted fields and try again.",
        fieldErrors: { sourceId: ["Select one of your own sources."] },
      };
    }
  }

  const scheduledAt =
    parsed.data.status === "scheduled"
      ? new Date(parsed.data.scheduledAt).toISOString()
      : null;
  const { data, error } = await client
    .from("content_items")
    .insert({
      user_id: user.id,
      channel_id: parsed.data.channelId || null,
      source_id: parsed.data.sourceId || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      scheduled_at: scheduledAt,
      source_url: parsed.data.sourceUrl || null,
      license_status: parsed.data.licenseStatus,
    })
    .select("id")
    .single();

  if (error) {
    logServerError("Queue item creation failed", error, { userId: user.id });
    return {
      ok: false,
      message: "The content item could not be created. Please try again.",
    };
  }

  await recordAutomationLog(
    client,
    user.id,
    "content.created",
    "A content item was added to the queue.",
    {
      content_item_id: data.id,
    },
  );
  revalidatePath("/queue");
  revalidatePath("/dashboard");

  return { ok: true, message: "Content item created.", data: null };
}
