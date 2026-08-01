import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDashboardIdentity } from "@/features/auth/queries";

import DashboardLoading from "./loading";

async function AuthenticatedDashboard({ children }: { children: ReactNode }) {
  const user = await getDashboardIdentity();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
