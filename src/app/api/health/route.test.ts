import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns service status without exposing configuration", async () => {
    const response = GET();
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toMatchObject({
      status: "ok",
      service: "youtube-content-agent",
    });
    expect(body).not.toHaveProperty("env");
    expect(
      new Date((body as { timestamp: string }).timestamp).toString(),
    ).not.toBe("Invalid Date");
  });
});
