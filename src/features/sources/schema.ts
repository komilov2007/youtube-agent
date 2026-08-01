import * as z from "zod";

import {
  httpUrl,
  optionalHttpUrl,
  optionalText,
  requiredText,
} from "@/lib/validation/shared";

export const sourceTypes = ["youtube", "upload", "external"] as const;
export const licenseTypes = [
  "owned",
  "creative_commons",
  "licensed",
  "public_domain",
  "permission",
  "unknown",
] as const;
export const licenseStatuses = [
  "pending",
  "verified",
  "rejected",
  "expired",
] as const;

export const contentSourceSchema = z
  .object({
    name: requiredText("Source name", 2, 100),
    sourceUrl: httpUrl,
    sourceType: z.enum(sourceTypes),
    licenseType: z.enum(licenseTypes),
    licenseStatus: z.enum(licenseStatuses),
    attributionText: optionalText("Attribution", 500),
    evidenceUrl: optionalHttpUrl,
  })
  .superRefine((value, context) => {
    if (
      value.licenseStatus === "verified" &&
      !value.evidenceUrl &&
      value.licenseType !== "owned"
    ) {
      context.addIssue({
        code: "custom",
        path: ["evidenceUrl"],
        message:
          "Evidence is required before a third-party license can be marked verified.",
      });
    }

    if (value.licenseType === "creative_commons" && !value.attributionText) {
      context.addIssue({
        code: "custom",
        path: ["attributionText"],
        message: "Creative Commons sources require attribution text.",
      });
    }
  });

export type ContentSourceInput = z.infer<typeof contentSourceSchema>;
