import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env/public";
import { applyResponseHeaders } from "@/lib/supabase/response-headers";
import type { Database } from "@/types/database";

/**
 * Create a request-scoped Supabase client for Server Components, actions, and
 * route handlers. Cookie writes can be rejected while rendering a Server
 * Component; the proxy is responsible for refreshing those sessions.
 */
export async function createClient(responseHeaders?: Headers) {
  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
            if (responseHeaders) {
              applyResponseHeaders(responseHeaders, headersToSet);
            }
          } catch {
            // Server Components cannot set cookies. `src/proxy.ts` refreshes
            // them before rendering; actions and route handlers can write.
          }
        },
      },
    },
  );
}
