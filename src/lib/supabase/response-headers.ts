export const AUTH_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export function applyResponseHeaders(
  target: Headers,
  headers: Record<string, string>,
): void {
  for (const [name, value] of Object.entries(headers)) {
    target.set(name, value);
  }
}
