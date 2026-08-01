import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your secure content operations workspace.",
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-primary text-sm font-semibold">
          Start with a solid foundation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground leading-6">
          Set up the workspace you will use to plan and oversee content safely.
        </p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:ring-2 focus-visible:outline-none"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
