import Link from "next/link";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
  className?: string;
  href?: string;
};

function AppLogo({
  compact = false,
  className,
  href = "/dashboard",
}: AppLogoProps) {
  return (
    <Link
      href={href}
      aria-label="YouTube Content Agent"
      className={cn(
        "group focus-visible:ring-ring/30 flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-[1.03]">
        <Play className="size-4 fill-current" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold tracking-tight">
            Content Agent
          </span>
          <span className="text-muted-foreground block truncate text-[10px] font-medium tracking-[0.14em] uppercase">
            YouTube automation
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export { AppLogo };
