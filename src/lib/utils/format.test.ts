import { describe, expect, it } from "vitest";

import { formatDateTime, humanize } from "./format";

describe("format utilities", () => {
  it("turns enum values into readable labels", () => {
    expect(humanize("pending_approval")).toBe("Pending Approval");
  });

  it("returns a safe fallback for missing dates", () => {
    expect(formatDateTime(null)).toBe("Not set");
  });

  it("returns a safe fallback for invalid dates", () => {
    expect(formatDateTime("not-a-date")).toBe("Invalid date");
  });

  it("formats valid dates in the requested timezone", () => {
    const result = formatDateTime("2026-01-15T12:30:00.000Z", "Asia/Tashkent");

    expect(result).toContain("Jan 15, 2026");
    expect(result).toContain("5:30 PM");
  });

  it("falls back to UTC for an invalid timezone", () => {
    const value = "2026-01-15T12:30:00.000Z";

    expect(formatDateTime(value, "Not/A_Timezone")).toBe(
      formatDateTime(value, "UTC"),
    );
  });
});
