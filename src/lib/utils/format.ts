import { formatDistanceToNow, isValid, parseISO } from "date-fns";

export function humanize(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDateTime(
  value: string | null | undefined,
  timeZone = "UTC",
): string {
  if (!value) return "Not set";
  const date = parseISO(value);
  if (!isValid(date)) return "Invalid date";

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(date);
  }
}

export function formatRelativeTime(value: string): string {
  const date = parseISO(value);
  return isValid(date)
    ? formatDistanceToNow(date, { addSuffix: true })
    : "Unknown time";
}
