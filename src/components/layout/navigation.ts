import {
  BarChart3,
  Database,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings,
  Tv,
  type LucideIcon,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Channels",
    href: "/channels",
    icon: Tv,
  },
  {
    label: "Sources",
    href: "/sources",
    icon: Database,
  },
  {
    label: "Queue",
    href: "/queue",
    icon: ListChecks,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Logs",
    href: "/logs",
    icon: ScrollText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function getRouteTitle(pathname: string) {
  const matchingRoute = navigationItems.find(({ href }) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`),
  );

  return matchingRoute?.label ?? "Workspace";
}

export { getRouteTitle, navigationItems };
