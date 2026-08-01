import { NextResponse, type NextRequest } from "next/server";

import { getSafeNextPath } from "@/lib/auth/redirects";
import {
  applyResponseHeaders,
  AUTH_NO_STORE_HEADERS,
} from "@/lib/supabase/response-headers";
import { createClient } from "@/lib/supabase/server";

function loginErrorResponse(
  request: NextRequest,
  error: "missing_code" | "verification_failed",
  next: string,
) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  loginUrl.searchParams.set("next", next);
  const response = NextResponse.redirect(loginUrl);
  applyResponseHeaders(response.headers, AUTH_NO_STORE_HEADERS);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (!code) {
    return loginErrorResponse(request, "missing_code", next);
  }

  const responseHeaders = new Headers(AUTH_NO_STORE_HEADERS);
  const supabase = await createClient(responseHeaders);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginErrorResponse(request, "verification_failed", next);
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  applyResponseHeaders(response.headers, Object.fromEntries(responseHeaders));
  return response;
}
