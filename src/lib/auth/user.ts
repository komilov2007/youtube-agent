import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getSafeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
});

type RequireUserOptions = {
  /** A same-origin path restored after authentication. */
  next?: string;
  /** Override the sign-in route when an application has a specialized flow. */
  redirectTo?: string;
};

/** Return the verified Supabase user or redirect the request to sign in. */
export async function requireUser(
  options: RequireUserOptions = {},
): Promise<User> {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  const loginPath = getSafeNextPath(options.redirectTo, "/login");
  const nextPath = options.next ? getSafeNextPath(options.next) : undefined;

  if (!nextPath) {
    redirect(loginPath);
  }

  const separator = loginPath.includes("?") ? "&" : "?";
  redirect(`${loginPath}${separator}next=${encodeURIComponent(nextPath)}`);
}
