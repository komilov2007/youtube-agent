import type * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "bg-muted/20 flex min-h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="bg-background text-muted-foreground mb-4 flex size-11 items-center justify-center rounded-xl border shadow-xs [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h3 className="text-foreground text-base font-semibold tracking-tight">
        {title}
      </h3>
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-md text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
