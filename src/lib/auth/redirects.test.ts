import { describe, expect, it } from "vitest";

import { getSafeNextPath } from "./redirects";

describe("getSafeNextPath", () => {
  it("preserves same-application paths and their query strings", () => {
    expect(getSafeNextPath("/queue?status=ready")).toBe("/queue?status=ready");
  });

  it.each([
    "https://malicious.example/path",
    "//malicious.example/path",
    "/\\\\malicious.example/path",
  ])("rejects an external redirect target: %s", (target) => {
    expect(getSafeNextPath(target)).toBe("/dashboard");
  });

  it("uses a caller-provided fallback for missing values", () => {
    expect(getSafeNextPath(undefined, "/login")).toBe("/login");
  });
});
