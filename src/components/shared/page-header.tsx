import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
};

function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
              {breadcrumbs.map((item, index) => {
                const isCurrent = index === breadcrumbs.length - 1;

                return (
                  <Fragment key={`${item.label}-${index}`}>
                    {index > 0 ? (
                      <li aria-hidden="true">
                        <ChevronRight className="size-3.5" />
                      </li>
                    ) : null}
                    <li>
                      {item.href && !isCurrent ? (
                        <Link
                          href={item.href}
                          className="hover:text-foreground focus-visible:ring-ring/30 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span aria-current={isCurrent ? "page" : undefined}>
                          {item.label}
                        </span>
                      )}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-1.5 max-w-3xl text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export { PageHeader };
export type { BreadcrumbItem, PageHeaderProps };
