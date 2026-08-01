type LogContext = Record<string, string | number | boolean | null | undefined>;

export function logServerError(
  message: string,
  error: unknown,
  context: LogContext = {},
): void {
  const detail = error instanceof Error ? error.message : "Unknown error";
  console.error(`[youtube-content-agent] ${message}`, { ...context, detail });
}
