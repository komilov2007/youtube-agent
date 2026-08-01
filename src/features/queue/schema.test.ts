import { describe, expect, it } from "vitest";

import { contentItemSchema } from "./schema";

const validDraft = {
  title: "Creator interview excerpt",
  description: "Prepared for internal editorial review.",
  channelId: "",
  sourceId: "",
  status: "draft" as const,
  scheduledAt: "",
  sourceUrl: "https://example.com/original",
  licenseStatus: "pending" as const,
};

describe("contentItemSchema", () => {
  it("accepts a valid draft without a channel or schedule", () => {
    expect(contentItemSchema.safeParse(validDraft).success).toBe(true);
  });

  it("rejects a scheduled item without a destination channel", () => {
    const result = contentItemSchema.safeParse({
      ...validDraft,
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.channelId?.[0]).toMatch(
        /destination channel/i,
      );
    }
  });

  it("rejects schedules in the past", () => {
    const result = contentItemSchema.safeParse({
      ...validDraft,
      status: "scheduled",
      channelId: "fdda765f-fc57-5604-a269-52a7df8164ec",
      scheduledAt: "2020-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.scheduledAt?.[0]).toMatch(
        /future/i,
      );
    }
  });

  it("rejects a server schedule without an explicit timezone", () => {
    const result = contentItemSchema.safeParse({
      ...validDraft,
      status: "scheduled",
      channelId: "fdda765f-fc57-5604-a269-52a7df8164ec",
      scheduledAt: "2099-01-01T12:00",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.scheduledAt?.[0]).toMatch(
        /explicit timezone offset/i,
      );
    }
  });

  it("rejects impossible calendar dates", () => {
    const result = contentItemSchema.safeParse({
      ...validDraft,
      status: "scheduled",
      channelId: "fdda765f-fc57-5604-a269-52a7df8164ec",
      scheduledAt: "2027-02-30T10:00:00Z",
    });

    expect(result.success).toBe(false);
  });
});
