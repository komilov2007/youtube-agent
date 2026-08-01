import { ListVideo } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listChannels } from "@/features/channels/queries";
import { ContentItemDialog } from "@/features/queue/content-item-dialog";
import {
  isQueueStatusFilter,
  listQueueItems,
  queueStatuses,
  type QueueStatusFilter,
} from "@/features/queue/queries";
import { StatusBadge } from "@/features/shared/status-badge";
import { RouteFilter } from "@/features/shared/route-filter";
import { getUserTimeZone } from "@/features/settings/queries";
import { listContentSources } from "@/features/sources/queries";
import { formatDateTime, humanize } from "@/lib/utils/format";

type QueuePageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const parameters = await searchParams;
  const rawStatus = Array.isArray(parameters.status)
    ? parameters.status[0]
    : parameters.status;
  const status: QueueStatusFilter = isQueueStatusFilter(rawStatus)
    ? rawStatus
    : "all";
  const [items, channels, sources, timeZone] = await Promise.all([
    listQueueItems(status),
    listChannels(),
    listContentSources(),
    getUserTimeZone(),
  ]);
  const dialog = (
    <ContentItemDialog
      channels={channels.map(({ id, name }) => ({ id, name }))}
      sources={sources.map(({ id, name }) => ({ id, name }))}
      timeZone={timeZone}
    />
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Publishing queue"
        description="Prepare and review content records without triggering uploads or external publishing."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Queue" },
        ]}
        actions={
          <>
            <RouteFilter
              label="Statuses"
              queryKey="status"
              value={status}
              options={queueStatuses}
            />
            {dialog}
          </>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<ListVideo aria-hidden="true" />}
          title={
            status === "all"
              ? "The queue is empty"
              : `No ${humanize(status).toLowerCase()} items`
          }
          description={
            status === "all"
              ? "Create a content item to establish the approval and scheduling workflow. Nothing will be published in Phase 1."
              : "No queue records match this status filter. Choose another filter or create a new item."
          }
          action={dialog}
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-72 whitespace-normal">
                      <p className="font-medium">{item.title}</p>
                      {item.description ? (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {item.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={item.status} />
                    </TableCell>
                    <TableCell>{item.channelName ?? "Unassigned"}</TableCell>
                    <TableCell>{item.sourceName ?? "Unassigned"}</TableCell>
                    <TableCell>
                      {item.scheduled_at ? (
                        <time dateTime={item.scheduled_at}>
                          {formatDateTime(item.scheduled_at, timeZone)}
                        </time>
                      ) : (
                        <span className="text-muted-foreground">
                          Not scheduled
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={item.license_status} />
                    </TableCell>
                    <TableCell>
                      <time dateTime={item.created_at}>
                        {formatDateTime(item.created_at, timeZone)}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
