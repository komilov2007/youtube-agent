"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-svh">
      <ErrorState retry={unstable_retry} />
    </main>
  );
}
