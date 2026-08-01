"use client";

import { AlertTriangle } from "lucide-react";

type AuthErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AuthError({ unstable_retry }: AuthErrorProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="bg-destructive/10 ring-destructive/20 mx-auto flex size-12 items-center justify-center rounded-full ring-1">
        <AlertTriangle aria-hidden="true" className="text-destructive size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          We could not load this page
        </h1>
        <p className="text-muted-foreground leading-6">
          Your account is safe. Try loading the authentication page again.
        </p>
      </div>
      <button
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40 h-11 rounded-lg px-5 text-sm font-semibold outline-none focus-visible:ring-4"
        onClick={unstable_retry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
