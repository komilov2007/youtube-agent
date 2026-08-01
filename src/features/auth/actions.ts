"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSignInErrorMessage, getSignUpErrorMessage } from "./errors";
import { loginSchema, registerSchema } from "./schemas";
import type { AuthActionResult, AuthFieldErrors, AuthFieldName } from "./types";
import { getPublicEnv } from "@/lib/env/public";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

function getFieldErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
) {
  const errors: AuthFieldErrors = {};
  const allowedFields = new Set<AuthFieldName>([
    "email",
    "password",
    "fullName",
    "confirmPassword",
  ]);

  for (const issue of issues) {
    const [field] = issue.path;

    if (
      typeof field !== "string" ||
      !allowedFields.has(field as AuthFieldName)
    ) {
      continue;
    }

    const fieldName = field as AuthFieldName;
    errors[fieldName] = [...(errors[fieldName] ?? []), issue.message];
  }

  return errors;
}

export async function signInAction(
  input: unknown,
  next?: string,
): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Correct the highlighted fields and try again.",
      fieldErrors: getFieldErrors(validation.error.issues),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {
      success: false,
      message: getSignInErrorMessage(error),
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Signed in successfully.",
    redirectTo: getSafeNextPath(next),
  };
}

export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  const validation = registerSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Correct the highlighted fields and try again.",
      fieldErrors: getFieldErrors(validation.error.issues),
    };
  }

  const env = getPublicEnv();
  const callbackUrl = new URL("/auth/callback", env.NEXT_PUBLIC_APP_URL);
  callbackUrl.searchParams.set("next", "/dashboard");

  const supabase = await createClient();
  const { fullName, email, password } = validation.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return {
      success: false,
      message: getSignUpErrorMessage(error),
    };
  }

  revalidatePath("/", "layout");

  if (data.session) {
    return {
      success: true,
      message: "Your account is ready.",
      redirectTo: "/dashboard",
    };
  }

  return {
    success: true,
    message:
      "Check your inbox to confirm your email address, then sign in to continue.",
  };
}

export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error("Unable to sign out. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
