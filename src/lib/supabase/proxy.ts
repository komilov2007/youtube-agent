import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env/public";
import { applyResponseHeaders } from "@/lib/supabase/response-headers";
import type { Database } from "@/types/database";

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });
  const env = getPublicEnv();

  // A Supabase session is always cookie-backed in this application. Avoid a
  // network round trip for plainly anonymous requests; authenticated requests
  // are still verified below with `getUser`, and the DAL re-verifies them at
  // every protected data access boundary.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

  if (!hasAuthCookie) {
    return { response, user: null };
  }

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({
            request: { headers: request.headers },
          });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          applyResponseHeaders(response.headers, headersToSet);
        },
      },
    },
  );

  // `getUser` validates the access token with Supabase Auth. Do not trust
  // `getSession` alone for route protection because cookie data is untrusted.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

export function copySessionCookies(
  source: NextResponse,
  destination: NextResponse,
) {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }

  for (const name of ["Cache-Control", "Expires", "Pragma"] as const) {
    const value = source.headers.get(name);
    if (value) destination.headers.set(name, value);
  }

  return destination;
}
