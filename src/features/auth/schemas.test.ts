import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("normalizes a valid email without changing the password", () => {
    expect(
      loginSchema.parse({
        email: "  Creator@Example.COM ",
        password: " keep spaces ",
      }),
    ).toEqual({
      email: "creator@example.com",
      password: " keep spaces ",
    });
  });

  it("reports invalid email and missing password independently", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.email).toContain("Enter a valid email address.");
      expect(fields.password).toContain("Password is required.");
    }
  });
});

describe("registerSchema", () => {
  const validRegistration = {
    fullName: "Ada Creator",
    email: "ada@example.com",
    password: "secure123",
    confirmPassword: "secure123",
  };

  it("accepts and normalizes a complete registration", () => {
    expect(
      registerSchema.parse({
        ...validRegistration,
        fullName: "  Ada Creator  ",
        email: " ADA@EXAMPLE.COM ",
      }),
    ).toEqual(validRegistration);
  });

  it("requires a useful name and a password with letters and numbers", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      fullName: "A",
      password: "password",
      confirmPassword: "password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.fullName).toContain(
        "Full name must be at least 2 characters.",
      );
      expect(fields.password).toContain(
        "Password must include at least one number.",
      );
    }
  });

  it("reports password confirmation mismatches on the confirmation field", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        "Passwords do not match.",
      );
    }
  });
});
