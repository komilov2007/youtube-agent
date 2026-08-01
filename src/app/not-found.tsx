import Link from "next/link";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12 text-center">
      <AppLogo href="/" />
      <p className="text-primary mt-12 font-mono text-sm font-semibold tracking-[0.2em]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed sm:text-base">
        The page may have moved, or the address may be incorrect.
      </p>
      <Button asChild className="mt-7">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
