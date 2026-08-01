"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { navigationItems } from "./navigation";

type AppSidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  showCollapseControl?: boolean;
  className?: string;
};

function AppSidebar({
  collapsed = false,
  onToggle,
  onNavigate,
  showCollapseControl = true,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full flex-col border-r",
        className,
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "border-sidebar-border flex h-16 shrink-0 items-center border-b px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <AppLogo compact={collapsed} />
      </div>

      <nav
        className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-4"
        aria-label="Workspace"
      >
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-ring/30 flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--sidebar-primary)_12%,transparent)]",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[1.05rem] shrink-0 transition-colors",
                      isActive && "text-sidebar-primary",
                    )}
                    aria-hidden="true"
                  />
                  {collapsed ? (
                    <span className="sr-only">{item.label}</span>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {showCollapseControl && onToggle ? (
        <div className="border-sidebar-border shrink-0 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-start",
              collapsed && "justify-center px-0",
            )}
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" />
            ) : (
              <PanelLeftClose aria-hidden="true" />
            )}
            {!collapsed ? <span>Collapse sidebar</span> : null}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

export { AppSidebar };
export type { AppSidebarProps };
