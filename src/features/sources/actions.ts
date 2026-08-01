"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { logServerError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { invalidActionResult } from "@/lib/validation/action-result";
import type { ActionResult } from "@/types/actions";

import { recordAutomationLog } from "../logs/write";
import { contentSourceSchema } from "./schema";

export async function createContentSource(
  input: unknown,
): Promise<ActionResult> {
  const parsed = contentSourceSchema.safeParse(input);
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
    .from("content_sources")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      source_url: parsed.data.sourceUrl,
      source_type: parsed.data.sourceType,
      license_type: parsed.data.licenseType,
      license_status: parsed.data.licenseStatus,
      attribution_text: parsed.data.attributionText || null,
      evidence_url: parsed.data.evidenceUrl || null,
    })
    .select("id")
    .single();

  if (error) {
    logServerError("Content source creation failed", error, {
      userId: user.id,
    });
    return {
      ok: false,
      message: "The source could not be saved. Please try again.",
    };
  }

  await recordAutomationLog(
    client,
    user.id,
    "source.created",
    "A licensed content source was added.",
    {
      source_id: data.id,
    },
  );
  revalidatePath("/sources");
  revalidatePath("/dashboard");

  return { ok: true, message: "Content source saved.", data: null };
}
