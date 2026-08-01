import {
  Activity,
  Bot,
  CircleAlert,
  ListVideo,
  Radio,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { StatusBadge } from "@/features/shared/status-badge";
import { formatRelativeTime } from "@/lib/utils/format";

const metricCards = [
  {
    key: "channels",
    label: "Channels",
    description: "Local destination records",
    icon: Radio,
  },
  {
    key: "queued",
    label: "In queue",
    description: "Open workflow items",
    icon: ListVideo,
  },
  {
    key: "published",
    label: "Published",
    description: "Recorded published items",
    icon: Upload,
  },
  {
    key: "failed",
    label: "Failed",
    description: "Items requiring attention",
    icon: CircleAlert,
  },
] as const;

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const hasData =
    summary.channels > 0 ||
    summary.queued > 0 ||
    summary.published > 0 ||
    summary.failed > 0 ||
    summary.recentActivity.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Monitor your content operations foundation from one secure workspace."
        breadcrumbs={[{ label: "Workspace" }, { label: "Dashboard" }]}
      />

      <section aria-labelledby="overview-heading" className="space-y-4">
        <h2 id="overview-heading" className="sr-only">
          Workspace overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.key} className="gap-4 py-5">
                <CardHeader className="grid grid-cols-[1fr_auto] px-5">
                  <div className="space-y-1">
                    <CardDescription>{metric.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">
                      {summary[metric.key]}
                    </CardTitle>
                  </div>
                  <div className="bg-muted/30 text-muted-foreground flex size-10 items-center justify-center rounded-lg border">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground px-5 text-xs">
                  {metric.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {!hasData ? (
        <EmptyState
          icon={<Activity aria-hidden="true" />}
          title="Your workspace is ready"
          description="Add a channel and a licensed source to begin building a reviewable content queue. Activity will appear here as real records are created."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest persisted events from your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentActivity.length === 0 ? (
              <EmptyState
                className="min-h-48"
                icon={<Activity aria-hidden="true" />}
                title="No activity recorded"
                description="Real channel, source, queue, and settings events will appear after you make changes."
              />
            ) : (
              <ul className="divide-y" aria-label="Recent activity">
                {summary.recentActivity.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {entry.event}
                        </p>
                        <StatusBadge value={entry.level} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {entry.message}
                      </p>
                    </div>
                    <time
                      dateTime={entry.created_at}
                      className="text-muted-foreground shrink-0 text-xs"
                    >
                      {formatRelativeTime(entry.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot
                  className="text-muted-foreground size-5"
                  aria-hidden="true"
                />
                <CardTitle>Automation</CardTitle>
              </div>
              <Badge variant={summary.automationEnabled ? "success" : "muted"}>
                {summary.automationEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <CardDescription>
              This setting is stored securely. Background publishing and
              external integrations are not active in Phase 1.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
