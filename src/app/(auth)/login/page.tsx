import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/components";
import { getAuthPageError } from "@/features/auth/messages";
import { getSafeNextPath } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your content operations workspace.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getSafeNextPath(getFirstValue(params.next));
  const initialError = getAuthPageError(getFirstValue(params.error));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-primary text-sm font-semibold">Welcome back</p>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground leading-6">
          Continue to your channels, content queue, and automation settings.
        </p>
      </div>

      <LoginForm initialError={initialError} next={next} />

      <p className="text-muted-foreground text-center text-sm">
        New to YouTube Content Agent?{" "}
        <Link
          className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:ring-2 focus-visible:outline-none"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
