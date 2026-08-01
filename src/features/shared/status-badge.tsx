import { Badge, type BadgeProps } from "@/components/ui/badge";
import { humanize } from "@/lib/utils/format";

const variants: Record<string, BadgeProps["variant"]> = {
  active: "success",
  approved: "success",
  published: "success",
  verified: "success",
  draft: "muted",
  debug: "muted",
  pending: "warning",
  pending_approval: "warning",
  scheduled: "warning",
  warning: "warning",
  error: "destructive",
  failed: "destructive",
  rejected: "destructive",
  expired: "destructive",
  cancelled: "muted",
  paused: "muted",
  info: "secondary",
  publishing: "secondary",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant={variants[value] ?? "outline"}>{humanize(value)}</Badge>
  );
}
