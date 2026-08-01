import { describe, expect, it } from "vitest";

import { wallTimeToIso } from "./time-zone";

describe("wallTimeToIso", () => {
  it("interprets a wall time in its saved IANA timezone", () => {
    expect(wallTimeToIso("2026-01-15T15:00", "Asia/Tashkent")).toBe(
      "2026-01-15T10:00:00.000Z",
    );
  });

  it("honors seasonal timezone offsets", () => {
    expect(wallTimeToIso("2026-07-15T15:00", "America/New_York")).toBe(
      "2026-07-15T19:00:00.000Z",
    );
  });

  it("rejects nonexistent daylight-saving wall times", () => {
    expect(wallTimeToIso("2026-03-08T02:30", "America/New_York")).toBeNull();
  });

  it("rejects malformed values and invalid timezones", () => {
    expect(wallTimeToIso("not-a-date", "UTC")).toBeNull();
    expect(wallTimeToIso("2026-01-15T15:00", "Not/A_Timezone")).toBeNull();
  });
});
