"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

export default function DashboardError({
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
    <ErrorState
      title="We couldn’t load this page"
      description="Your workspace is still safe. Try loading this section again."
      retry={unstable_retry}
    />
  );
}
