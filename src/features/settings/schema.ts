import * as z from "zod";

import { isValidTimeZone, optionalText } from "@/lib/validation/shared";

export const supportedLanguages = ["en", "uz", "ru"] as const;

export const settingsSchema = z.object({
  fullName: optionalText("Full name", 100),
  timezone: z
    .string()
    .trim()
    .min(1, "Choose a timezone.")
    .refine(isValidTimeZone, "Choose a valid IANA timezone."),
  language: z.enum(supportedLanguages),
  dailyPublishLimit: z
    .number()
    .int("Daily publish limit must be a whole number.")
    .min(0, "Daily publish limit cannot be negative.")
    .max(50, "Daily publish limit cannot exceed 50."),
  automationEnabled: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
