import * as z from "zod";

import { requiredText } from "@/lib/validation/shared";

export const channelSchema = z.object({
  name: requiredText("Channel name", 2, 80),
  platform: z.literal("youtube"),
});

export type ChannelInput = z.infer<typeof channelSchema>;
