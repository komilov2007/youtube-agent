import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main
      className="flex min-h-svh items-center justify-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div className="bg-card shadow-card flex size-11 items-center justify-center rounded-xl border">
          <LoaderCircle
            className="text-primary size-5 animate-spin"
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 text-sm font-medium">Loading your workspace</p>
        <p className="text-muted-foreground mt-1 text-xs">
          This should only take a moment.
        </p>
      </div>
    </main>
  );
}
