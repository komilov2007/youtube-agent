import { parsePublicEnv } from "./schemas";

/**
 * Read browser-safe variables through direct property access so Next.js can
 * inline them in client bundles. Validation stays lazy so schema-only tooling
 * and unit tests do not need application credentials.
 */
export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
