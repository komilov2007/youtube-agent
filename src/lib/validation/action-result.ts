import type * as z from "zod";

import type { ActionResult } from "@/types/actions";

export function invalidActionResult(error: z.ZodError): ActionResult {
  return {
    ok: false,
    message: "Review the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}
