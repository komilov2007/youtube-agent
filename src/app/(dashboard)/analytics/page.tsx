import { BarChart3, CircleOff, Database, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const readiness = [
  {
    title: "YouTube connection",
    description:
      "OAuth and channel analytics access are intentionally outside Phase 1.",
    icon: CircleOff,
    status: "Not connected",
  },
  {
    title: "Analytics storage",
    description: "No external performance data has been imported or invented.",
    icon: Database,
    status: "Awaiting integration",
  },
  {
    title: "Data boundaries",
    description:
      "Future analytics records will inherit the same per-user access controls.",
    icon: ShieldCheck,
    status: "Foundation ready",
  },
] as const;

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="A truthful foundation for performance reporting—without fabricated charts or metrics."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Analytics" },
        ]}
      />

      <Alert>
        <BarChart3 aria-hidden="true" />
        <AlertTitle>YouTube Analytics is not connected</AlertTitle>
        <AlertDescription>
          This page will display authorized, source-backed channel and content
          performance data after the YouTube integration is implemented in a
          future phase.
        </AlertDescription>
      </Alert>

      <section aria-labelledby="analytics-readiness" className="space-y-4">
        <h2 id="analytics-readiness" className="text-lg font-semibold">
          Integration readiness
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {readiness.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-muted/30 text-muted-foreground flex size-10 items-center justify-center rounded-lg border">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <Badge
                      variant={
                        item.status === "Foundation ready" ? "success" : "muted"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <CardTitle className="pt-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </section>

      <EmptyState
        icon={<BarChart3 aria-hidden="true" />}
        title="No analytics data available"
        description="Once a future YouTube OAuth integration is explicitly connected, real metrics can be synchronized and presented here."
      />
    </div>
  );
}
