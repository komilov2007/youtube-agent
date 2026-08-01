"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FieldError } from "@/features/shared/field-error";
import type { SettingsView } from "@/features/settings/queries";

import { saveSettings } from "./actions";
import {
  settingsSchema,
  supportedLanguages,
  type SettingsInput,
} from "./schema";

const languageLabels: Record<(typeof supportedLanguages)[number], string> = {
  en: "English",
  uz: "Uzbek",
  ru: "Russian",
};

export function SettingsForm({
  initialValues,
  timezones,
}: {
  initialValues: SettingsView;
  timezones: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: initialValues.fullName,
      timezone: initialValues.timezone,
      language: initialValues.language,
      dailyPublishLimit: initialValues.dailyPublishLimit,
      automationEnabled: initialValues.automationEnabled,
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (isPending) return;
    setServerMessage(null);
    startTransition(async () => {
      try {
        const result = await saveSettings(values);
        if (!result.ok) {
          setServerMessage(result.message);
          for (const [field, messages] of Object.entries(
            result.fieldErrors ?? {},
          )) {
            const message = messages?.[0];
            if (message) setError(field as keyof SettingsInput, { message });
          }
          return;
        }

        toast.success(result.message);
      } catch {
        setServerMessage(
          "The request could not be completed. Check your connection and try again.",
        );
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {serverMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{serverMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Details shown in your account menu and activity history.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "full-name-error" : undefined}
              disabled={isPending}
              {...register("fullName")}
            />
            <FieldError
              id="full-name-error"
              message={errors.fullName?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              type="email"
              value={initialValues.email}
              readOnly
              aria-readonly="true"
            />
            <p className="text-muted-foreground text-xs">
              Managed by Supabase Authentication.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application preferences</CardTitle>
          <CardDescription>
            Defaults for scheduling and future automation workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="timezone"
                    className="w-full"
                    aria-invalid={Boolean(errors.timezone)}
                    aria-describedby={
                      errors.timezone ? "timezone-error" : undefined
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError
              id="timezone-error"
              message={errors.timezone?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="language"
                    className="w-full"
                    aria-invalid={Boolean(errors.language)}
                    aria-describedby={
                      errors.language ? "language-error" : undefined
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {languageLabels[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError
              id="language-error"
              message={errors.language?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-publish-limit">Daily publish limit</Label>
            <Input
              id="daily-publish-limit"
              type="number"
              min={0}
              max={50}
              step={1}
              inputMode="numeric"
              aria-invalid={Boolean(errors.dailyPublishLimit)}
              aria-describedby="daily-publish-limit-help daily-publish-limit-error"
              disabled={isPending}
              {...register("dailyPublishLimit", { valueAsNumber: true })}
            />
            <p
              id="daily-publish-limit-help"
              className="text-muted-foreground text-xs"
            >
              Reserved as a safety cap for publishing automation in a later
              phase.
            </p>
            <FieldError
              id="daily-publish-limit-error"
              message={errors.dailyPublishLimit?.message}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:mt-6">
            <div className="space-y-1">
              <Label htmlFor="automation-enabled">Automation enabled</Label>
              <p id="automation-help" className="text-muted-foreground text-xs">
                Stores your preference only; no background automation runs in
                Phase 1.
              </p>
            </div>
            <Controller
              name="automationEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="automation-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  aria-describedby="automation-help"
                  disabled={isPending}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
