"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardUser = {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
};

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

function UserMenu({ user }: { user: DashboardUser }) {
  const displayName = user.name?.trim() || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 max-w-52 gap-2 px-1.5 sm:px-2"
          aria-label="Open account menu"
        >
          <Avatar className="size-7 border">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-1 text-left md:block">
            <span className="block truncate text-xs font-medium">
              {displayName}
            </span>
            <span className="text-muted-foreground block truncate text-[11px] font-normal">
              {user.email}
            </span>
          </span>
          <ChevronDown
            className="text-muted-foreground hidden size-3.5 md:block"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="text-foreground block truncate text-sm font-medium">
            {displayName}
          </span>
          <span className="text-muted-foreground mt-0.5 block truncate text-xs">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <UserRound aria-hidden="true" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut aria-hidden="true" />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
export type { DashboardUser };
