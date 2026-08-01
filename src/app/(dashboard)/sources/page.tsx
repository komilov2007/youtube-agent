import { ExternalLink, Library } from "lucide-react";

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
import { StatusBadge } from "@/features/shared/status-badge";
import { getUserTimeZone } from "@/features/settings/queries";
import { listContentSources } from "@/features/sources/queries";
import { SourceDialog } from "@/features/sources/source-dialog";
import { formatDateTime, humanize } from "@/lib/utils/format";

export default async function SourcesPage() {
  const [sources, timeZone] = await Promise.all([
    listContentSources(),
    getUserTimeZone(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content sources"
        description="Keep an auditable record of source URLs, attribution, and licensing evidence."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Sources" },
        ]}
        actions={<SourceDialog />}
      />

      {sources.length === 0 ? (
        <EmptyState
          icon={<Library aria-hidden="true" />}
          title="No licensed sources recorded"
          description="Add a source with its origin and license details. Phase 1 stores metadata only and never downloads media."
          action={<SourceDialog />}
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attribution</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="max-w-64 whitespace-normal">
                      <p className="font-medium">{source.name}</p>
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground mt-1 inline-flex max-w-full items-center gap-1 text-xs hover:underline"
                      >
                        <span className="truncate">{source.source_url}</span>
                        <ExternalLink
                          className="size-3 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </TableCell>
                    <TableCell>{humanize(source.source_type)}</TableCell>
                    <TableCell>{humanize(source.license_type)}</TableCell>
                    <TableCell>
                      <StatusBadge value={source.license_status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-72 whitespace-normal">
                      {source.attribution_text ??
                        "Not required or not provided"}
                    </TableCell>
                    <TableCell>
                      {source.evidence_url ? (
                        <a
                          href={source.evidence_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          View evidence
                          <ExternalLink
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <time dateTime={source.created_at}>
                        {formatDateTime(source.created_at, timeZone)}
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
