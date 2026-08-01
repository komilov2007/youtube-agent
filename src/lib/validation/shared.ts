import * as z from "zod";

export const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

export const httpUrl = z
  .string()
  .max(2_048, "URL must be 2048 characters or fewer.")
  .pipe(z.url("Enter a valid URL."))
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    {
      message: "URL must start with http:// or https://.",
    },
  );

export const optionalHttpUrl = z.union([z.literal(""), httpUrl]);

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
