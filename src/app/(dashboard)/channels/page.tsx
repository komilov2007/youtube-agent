import { Radio, TvMinimalPlay } from "lucide-react";

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
import { ChannelDialog } from "@/features/channels/channel-dialog";
import { listChannels } from "@/features/channels/queries";
import { StatusBadge } from "@/features/shared/status-badge";
import { getUserTimeZone } from "@/features/settings/queries";
import { formatDateTime, humanize } from "@/lib/utils/format";

export default async function ChannelsPage() {
  const [channels, timeZone] = await Promise.all([
    listChannels(),
    getUserTimeZone(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Channels"
        description="Manage local publishing destinations before connecting YouTube OAuth in a later phase."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Channels" },
        ]}
        actions={<ChannelDialog />}
      />

      {channels.length === 0 ? (
        <EmptyState
          icon={<Radio aria-hidden="true" />}
          title="No channels yet"
          description="Create a local channel record to organize future content. This does not connect to or modify a YouTube account."
          action={<ChannelDialog />}
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">
                      {channel.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <TvMinimalPlay
                          className="text-muted-foreground size-4"
                          aria-hidden="true"
                        />
                        {humanize(channel.platform)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={channel.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {channel.youtube_channel_id ?? "Not connected"}
                    </TableCell>
                    <TableCell>
                      <time dateTime={channel.created_at}>
                        {formatDateTime(channel.created_at, timeZone)}
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
