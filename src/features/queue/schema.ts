import * as z from "zod";

import { licenseStatuses } from "@/features/sources/schema";
import {
  optionalHttpUrl,
  optionalText,
  requiredText,
} from "@/lib/validation/shared";

export const creatableContentStatuses = [
  "draft",
  "pending_approval",
  "approved",
  "scheduled",
] as const;

const contentItemFields = z.object({
  title: requiredText("Title", 3, 100),
  description: optionalText("Description", 5_000),
  channelId: z.union([z.literal(""), z.uuid("Select a valid channel.")]),
  sourceId: z.union([z.literal(""), z.uuid("Select a valid source.")]),
  status: z.enum(creatableContentStatuses),
  scheduledAt: z.string().trim(),
  sourceUrl: optionalHttpUrl,
  licenseStatus: z.enum(licenseStatuses),
});
const exactDateTimeSchema = z.iso.datetime({ offset: true });

function validateContentItem(
  value: z.infer<typeof contentItemFields>,
  context: z.RefinementCtx,
) {
  const scheduled = value.scheduledAt ? new Date(value.scheduledAt) : null;
  const hasValidSchedule =
    scheduled !== null && !Number.isNaN(scheduled.getTime());

  if (value.status !== "scheduled" && value.scheduledAt && !hasValidSchedule) {
    context.addIssue({
      code: "custom",
      path: ["scheduledAt"],
      message: "Choose a valid date and time.",
    });
  }

  if (value.status === "scheduled") {
    if (!hasValidSchedule) {
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Choose a valid date and time for scheduled content.",
      });
    }
  }

  if (value.status === "scheduled" && !value.channelId) {
    context.addIssue({
      code: "custom",
      path: ["channelId"],
      message: "Scheduled content must have a destination channel.",
    });
  }
}

export const contentItemFormSchema =
  contentItemFields.superRefine(validateContentItem);

export const contentItemSchema = contentItemFormSchema.superRefine(
  (value, context) => {
    if (value.status !== "scheduled") return;

    const exactDateTime = exactDateTimeSchema.safeParse(value.scheduledAt);
    if (!exactDateTime.success) {
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message:
          "Scheduled time must be a valid ISO date with an explicit timezone offset.",
      });
    } else if (new Date(exactDateTime.data).getTime() <= Date.now()) {
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Scheduled time must be in the future.",
      });
    }
  },
);

export type ContentItemInput = z.infer<typeof contentItemFormSchema>;
