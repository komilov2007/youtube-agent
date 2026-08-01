import { createClient } from "@supabase/supabase-js";
import * as z from "zod";

import type { Database, Json, TablesInsert } from "../src/types/database";

const httpUrlSchema = z
  .string()
  .max(2_048)
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Must use the http or https protocol");

const environmentSchema = z.object({
  SEED_ENVIRONMENT: z.literal("development", {
    error: "SEED_ENVIRONMENT must explicitly be development",
  }),
  SEED_USER_ID: z.string().uuid(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_URL: httpUrlSchema,
});

function readEnvironment() {
  const productionMarkers = [
    process.env.NODE_ENV,
    process.env.VERCEL_ENV,
    process.env.SUPABASE_ENV,
  ]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase());

  if (productionMarkers.includes("production")) {
    throw new Error(
      "Refusing to seed: a production environment marker is set.",
    );
  }

  const result = environmentSchema.safeParse(process.env);

  if (!result.success) {
    const details = result.error.issues
      .map(
        (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
      )
      .join("\n");

    throw new Error(`Invalid seed environment:\n${details}`);
  }

  return result.data;
}

function optionalMetadataString(
  metadata: unknown,
  key: string,
  maxLength: number,
): string | null {
  if (typeof metadata !== "object" || metadata === null) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue.slice(0, maxLength) : null;
}

function optionalMetadataUrl(metadata: unknown, key: string): string | null {
  const value = optionalMetadataString(metadata, key, 2_048);
  return value && httpUrlSchema.safeParse(value).success ? value : null;
}

async function stableUuid(userId: string, recordName: string): Promise<string> {
  const input = new TextEncoder().encode(
    `youtube-content-agent:${userId}:${recordName}`,
  );
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", input));
  const bytes = digest.slice(0, 16);

  // Mark the deterministic hash as an RFC 4122 version-5-style UUID.
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hexadecimal = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return [
    hexadecimal.slice(0, 8),
    hexadecimal.slice(8, 12),
    hexadecimal.slice(12, 16),
    hexadecimal.slice(16, 20),
    hexadecimal.slice(20, 32),
  ].join("-");
}

function formatFailure(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown seed failure";
}

async function main() {
  const environment = readEnvironment();
  const supabase = createClient<Database>(
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  const { data: userResult, error: userError } =
    await supabase.auth.admin.getUserById(environment.SEED_USER_ID);

  if (userError || !userResult.user) {
    throw new Error(
      `SEED_USER_ID does not identify an accessible existing auth user: ${
        userError?.message ?? "user not found"
      }`,
    );
  }

  if (!userResult.user.email) {
    throw new Error(
      "The seed user must be an existing email-based Supabase Auth user.",
    );
  }

  const userId = userResult.user.id;
  const [
    channelId,
    sourceId,
    approvedItemId,
    scheduledItemId,
    publishedItemId,
    failedItemId,
  ] = await Promise.all([
    stableUuid(userId, "channel"),
    stableUuid(userId, "source"),
    stableUuid(userId, "content-approved"),
    stableUuid(userId, "content-scheduled"),
    stableUuid(userId, "content-published"),
    stableUuid(userId, "content-failed"),
  ]);
  const [welcomeLogId, reviewLogId] = await Promise.all([
    stableUuid(userId, "log-welcome"),
    stableUuid(userId, "log-review"),
  ]);

  const profile: TablesInsert<"profiles"> = {
    avatar_url: optionalMetadataUrl(
      userResult.user.user_metadata as unknown,
      "avatar_url",
    ),
    email: userResult.user.email,
    full_name: optionalMetadataString(
      userResult.user.user_metadata as unknown,
      "full_name",
      120,
    ),
    id: userId,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profile, { ignoreDuplicates: true, onConflict: "id" });
  if (profileError) {
    throw new Error(
      `Could not ensure the user profile exists: ${profileError.message}`,
    );
  }

  const channel: TablesInsert<"channels"> = {
    id: channelId,
    name: "Demo YouTube Channel",
    platform: "youtube",
    status: "draft",
    user_id: userId,
  };
  const { error: channelError } = await supabase
    .from("channels")
    .upsert(channel, { ignoreDuplicates: true, onConflict: "id" });
  if (channelError) {
    throw new Error(`Could not seed the demo channel: ${channelError.message}`);
  }

  const source: TablesInsert<"content_sources"> = {
    attribution_text:
      "Development demo source — replace with real attribution before publishing.",
    evidence_url: "https://example.com/demo/license-evidence",
    id: sourceId,
    license_status: "verified",
    license_type: "permission",
    name: "Licensed Demo Source",
    source_type: "external",
    source_url: "https://example.com/demo/licensed-source",
    user_id: userId,
  };
  const { error: sourceError } = await supabase
    .from("content_sources")
    .upsert(source, { ignoreDuplicates: true, onConflict: "id" });
  if (sourceError) {
    throw new Error(`Could not seed the demo source: ${sourceError.message}`);
  }

  const now = Date.now();
  const scheduledAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const publishedAt = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const demoSourceUrl = "https://example.com/demo/licensed-source";

  const contentItems = [
    {
      channel_id: channelId,
      description:
        "A ready-for-review example that demonstrates the approval queue.",
      id: approvedItemId,
      license_status: "verified",
      source_id: sourceId,
      source_url: demoSourceUrl,
      status: "approved",
      title: "Review your first approved content item",
      user_id: userId,
    },
    {
      channel_id: channelId,
      description:
        "A development-only record illustrating scheduled queue state.",
      id: scheduledItemId,
      license_status: "verified",
      scheduled_at: scheduledAt,
      source_id: sourceId,
      source_url: demoSourceUrl,
      status: "scheduled",
      title: "Example scheduled content",
      user_id: userId,
    },
    {
      channel_id: channelId,
      description:
        "A development-only record used by the dashboard published summary.",
      external_video_id: `demo-published-${userId.slice(0, 8)}`,
      id: publishedItemId,
      license_status: "verified",
      published_at: publishedAt,
      source_id: sourceId,
      source_url: demoSourceUrl,
      status: "published",
      title: "Example published content",
      user_id: userId,
    },
    {
      channel_id: channelId,
      description: "A development-only record for exercising failed-state UI.",
      id: failedItemId,
      license_status: "verified",
      source_id: sourceId,
      source_url: demoSourceUrl,
      status: "failed",
      title: "Example item requiring attention",
      user_id: userId,
    },
  ] satisfies TablesInsert<"content_items">[];

  const { error: contentItemsError } = await supabase
    .from("content_items")
    .upsert(contentItems, { ignoreDuplicates: true, onConflict: "id" });
  if (contentItemsError) {
    throw new Error(
      `Could not seed demo content items: ${contentItemsError.message}`,
    );
  }

  const logs = [
    {
      event: "development.seed.completed",
      id: welcomeLogId,
      level: "info",
      message: "Development demo records were initialized for this account.",
      metadata: { seeded_by: "scripts/seed.ts" } satisfies Json,
      user_id: userId,
    },
    {
      event: "content.review.requested",
      id: reviewLogId,
      level: "warning",
      message:
        "Review source licensing and channel details before enabling automation.",
      metadata: { channel_id: channelId, source_id: sourceId } satisfies Json,
      user_id: userId,
    },
  ] satisfies TablesInsert<"automation_logs">[];

  const { error: logsError } = await supabase
    .from("automation_logs")
    .upsert(logs, { ignoreDuplicates: true, onConflict: "id" });
  if (logsError) {
    throw new Error(`Could not seed automation logs: ${logsError.message}`);
  }

  const settings: TablesInsert<"app_settings"> = {
    automation_enabled: false,
    daily_publish_limit: 1,
    language: "en",
    timezone: "UTC",
    user_id: userId,
  };
  const { error: settingsError } = await supabase
    .from("app_settings")
    .upsert(settings, { ignoreDuplicates: true, onConflict: "user_id" });
  if (settingsError) {
    throw new Error(
      `Could not seed application settings: ${settingsError.message}`,
    );
  }

  console.info(`Development seed completed for existing auth user ${userId}.`);
}

try {
  await main();
} catch (error: unknown) {
  console.error(`Development seed failed: ${formatFailure(error)}`);
  process.exitCode = 1;
}
