"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNavigation } from "./mobile-navigation";
import type { DashboardUser } from "./user-menu";

type DashboardShellProps = {
  user: DashboardUser;
  children: ReactNode;
};

function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="bg-background min-h-svh">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground fixed top-3 left-3 z-[100] -translate-y-20 rounded-md px-3 py-2 text-sm font-medium shadow-lg transition-transform focus:translate-y-0 focus:outline-none"
      >
        Skip to main content
      </a>

      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:flex",
          sidebarCollapsed ? "w-18" : "w-64",
        )}
      />

      <div
        className={cn(
          "min-w-0 transition-[padding] duration-200",
          sidebarCollapsed ? "lg:pl-18" : "lg:pl-64",
        )}
      >
        <AppHeader
          user={user}
          navigationOpen={mobileNavigationOpen}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[100rem] px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </main>
      </div>

      <MobileNavigation
        open={mobileNavigationOpen}
        onOpenChange={setMobileNavigationOpen}
      />
    </div>
  );
}

export { DashboardShell };
export type { DashboardShellProps };
