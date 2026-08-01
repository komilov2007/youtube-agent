import { PageHeader } from "@/components/shared/page-header";
import { getSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/features/settings/settings-form";

const fallbackTimezones = [
  "UTC",
  "Africa/Johannesburg",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tashkent",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/London",
] as const;

function getTimezones(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [...fallbackTimezones];

  return [...new Set([current, "UTC", ...supported])].sort((left, right) =>
    left.localeCompare(right),
  );
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile and safe defaults for future publishing automation."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <SettingsForm
        initialValues={settings}
        timezones={getTimezones(settings.timezone)}
      />
    </div>
  );
}
