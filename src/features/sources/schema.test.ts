import { describe, expect, it } from "vitest";

import { contentSourceSchema } from "./schema";

const validSource = {
  name: "Creator archive",
  sourceUrl: "https://example.com/original",
  sourceType: "youtube" as const,
  licenseType: "licensed" as const,
  licenseStatus: "pending" as const,
  attributionText: "Used with permission from the creator.",
  evidenceUrl: "",
};

describe("contentSourceSchema", () => {
  it("accepts a well-formed licensed source", () => {
    expect(contentSourceSchema.safeParse(validSource).success).toBe(true);
  });

  it("rejects invalid source URLs", () => {
    const result = contentSourceSchema.safeParse({
      ...validSource,
      sourceUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("requires attribution for Creative Commons sources", () => {
    const result = contentSourceSchema.safeParse({
      ...validSource,
      licenseType: "creative_commons",
      attributionText: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.attributionText?.[0]).toMatch(
        /require attribution/i,
      );
    }
  });

  it("requires evidence before third-party licensing is marked verified", () => {
    const result = contentSourceSchema.safeParse({
      ...validSource,
      licenseStatus: "verified",
      evidenceUrl: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.evidenceUrl?.[0]).toMatch(
        /evidence is required/i,
      );
    }
  });
});
