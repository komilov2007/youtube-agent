import { ScrollText } from "lucide-react";

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
import {
  isLogLevelFilter,
  listAutomationLogs,
  logLevels,
  type LogLevelFilter,
} from "@/features/logs/queries";
import { RouteFilter } from "@/features/shared/route-filter";
import { StatusBadge } from "@/features/shared/status-badge";
import { getUserTimeZone } from "@/features/settings/queries";
import { formatDateTime } from "@/lib/utils/format";

type LogsPageProps = {
  searchParams: Promise<{ level?: string | string[] }>;
};

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const parameters = await searchParams;
  const rawLevel = Array.isArray(parameters.level)
    ? parameters.level[0]
    : parameters.level;
  const level: LogLevelFilter = isLogLevelFilter(rawLevel) ? rawLevel : "all";
  const [logs, timeZone] = await Promise.all([
    listAutomationLogs(level),
    getUserTimeZone(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automation logs"
        description="Review persisted workspace events and, in future phases, automation execution details."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Logs" },
        ]}
        actions={
          <RouteFilter
            label="Levels"
            queryKey="level"
            value={level}
            options={logLevels}
          />
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText aria-hidden="true" />}
          title={
            level === "all"
              ? "No events recorded"
              : "No events match this level"
          }
          description={
            level === "all"
              ? "Events created by real workspace mutations will appear here. No sample logs are injected into production."
              : "Choose another log-level filter to review persisted events."
          }
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <time dateTime={log.created_at}>
                        {formatDateTime(log.created_at, timeZone)}
                      </time>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={log.level} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.event}
                    </TableCell>
                    <TableCell className="max-w-2xl whitespace-normal">
                      {log.message}
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
