import "server-only";

import { parseServerEnv } from "./schemas";

/** Server secrets are validated only when a privileged server feature uses them. */
export function getServerEnv() {
  return parseServerEnv({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  });
}
