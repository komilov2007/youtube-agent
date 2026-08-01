"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { getRouteTitle } from "./navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { UserMenu, type DashboardUser } from "./user-menu";

type AppHeaderProps = {
  user: DashboardUser;
  navigationOpen: boolean;
  onOpenNavigation: () => void;
};

function AppHeader({ user, navigationOpen, onOpenNavigation }: AppHeaderProps) {
  const pathname = usePathname();
  const title = getRouteTitle(pathname);

  return (
    <header className="bg-background/88 supports-[backdrop-filter]:bg-background/78 sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-ml-2 lg:hidden"
          onClick={onOpenNavigation}
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          aria-expanded={navigationOpen}
          aria-haspopup="dialog"
        >
          <Menu aria-hidden="true" />
        </Button>
        <div className="min-w-0">
          <p className="text-muted-foreground hidden text-[10px] font-medium tracking-[0.12em] uppercase sm:block">
            Workspace
          </p>
          <p className="truncate text-sm font-semibold tracking-tight sm:text-base">
            {title}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-3 py-5 text-center">
              <p className="text-sm font-medium">
                Notifications are not connected yet
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Workspace activity remains available in Automation Logs.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeSwitcher />
        <Separator
          orientation="vertical"
          className="mx-1.5 hidden h-6 sm:block"
        />
        <UserMenu user={user} />
      </div>
    </header>
  );
}

export { AppHeader };
