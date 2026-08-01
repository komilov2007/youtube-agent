import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "./schemas";

const validPublicEnv = {
  NEXT_PUBLIC_APP_URL: "https://agent.example.com",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "ci-anon-key-placeholder",
};

const validServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: "ci-service-role-placeholder-key",
  CRON_SECRET: "ci-cron-secret-placeholder",
};

describe("public environment validation", () => {
  it("returns validated browser-safe values", () => {
    expect(parsePublicEnv(validPublicEnv)).toEqual(validPublicEnv);
  });

  it("reports every missing public variable clearly", () => {
    expect(() => parsePublicEnv({})).toThrowError(
      /NEXT_PUBLIC_APP_URL.*NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  it("rejects non-URL application and Supabase values", () => {
    expect(() =>
      parsePublicEnv({
        ...validPublicEnv,
        NEXT_PUBLIC_SUPABASE_URL: "project.supabase.co",
      }),
    ).toThrowError(/valid absolute URL/);
  });

  it("rejects URLs with protocols that cannot serve the application", () => {
    expect(() =>
      parsePublicEnv({
        ...validPublicEnv,
        NEXT_PUBLIC_APP_URL: "javascript:alert('unsafe')",
      }),
    ).toThrowError(/must use the http or https protocol/);
  });
});

describe("server environment validation", () => {
  it("returns validated server-only values", () => {
    expect(parseServerEnv(validServerEnv)).toEqual(validServerEnv);
  });

  it("fails with a scoped error when secrets are missing", () => {
    expect(() => parseServerEnv({})).toThrowError(
      /Invalid server environment configuration.*SUPABASE_SERVICE_ROLE_KEY.*CRON_SECRET/,
    );
  });

  it("does not accept short placeholder secrets", () => {
    expect(() =>
      parseServerEnv({
        ...validServerEnv,
        CRON_SECRET: "short",
      }),
    ).toThrowError(/CRON_SECRET must be at least 16 characters/);
  });
});
