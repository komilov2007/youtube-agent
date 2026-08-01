import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth/redirects";
import { copySessionCookies, refreshSession } from "@/lib/supabase/proxy";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/channels",
  "/sources",
  "/queue",
  "/analytics",
  "/logs",
  "/settings",
] as const;

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "auth_required");
    loginUrl.searchParams.set("next", getSafeNextPath(`${pathname}${search}`));

    return copySessionCookies(response, NextResponse.redirect(loginUrl));
  }

  if (user && AUTH_ROUTES.has(pathname)) {
    const destination = getSafeNextPath(
      request.nextUrl.searchParams.get("next"),
    );
    const dashboardUrl = new URL(destination, request.url);

    return copySessionCookies(response, NextResponse.redirect(dashboardUrl));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/channels/:path*",
    "/sources/:path*",
    "/queue/:path*",
    "/analytics/:path*",
    "/logs/:path*",
    "/settings/:path*",
  ],
};
