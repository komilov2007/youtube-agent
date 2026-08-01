import * as z from "zod";

const requiredUrl = (name: string) =>
  z
    .string({ error: `${name} is required.` })
    .trim()
    .min(1, `${name} is required.`)
    .url(`${name} must be a valid absolute URL.`)
    .refine(
      (value) =>
        URL.canParse(value) &&
        ["http:", "https:"].includes(new URL(value).protocol),
      `${name} must use the http or https protocol.`,
    );

const requiredValue = (name: string) =>
  z
    .string({ error: `${name} is required.` })
    .trim()
    .min(1, `${name} is required.`);

const requiredSecret = (name: string, minimumLength: number) =>
  z
    .string({ error: `${name} is required.` })
    .trim()
    .min(
      minimumLength,
      `${name} must be at least ${minimumLength} characters.`,
    );

/** Values that may be embedded in the browser bundle. Never add secrets here. */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: requiredUrl("NEXT_PUBLIC_APP_URL"),
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl("NEXT_PUBLIC_SUPABASE_URL"),
  // Supabase supports both legacy JWT anon keys and newer publishable keys;
  // their formats differ, so require a non-empty value without guessing it.
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

/** Server-only values. Import them only through `@/lib/env/server`. */
export const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: requiredSecret("SUPABASE_SERVICE_ROLE_KEY", 20),
  CRON_SECRET: requiredSecret("CRON_SECRET", 16),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

type EnvironmentInput = Record<string, string | undefined>;

function formatEnvironmentError(scope: "public" | "server", error: z.ZodError) {
  const details = error.issues
    .map(
      (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
    )
    .join("; ");

  return new Error(`Invalid ${scope} environment configuration: ${details}`);
}

export function parsePublicEnv(input: EnvironmentInput): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw formatEnvironmentError("public", result.error);
  }

  return result.data;
}

export function parseServerEnv(input: EnvironmentInput): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    throw formatEnvironmentError("server", result.error);
  }

  return result.data;
}
