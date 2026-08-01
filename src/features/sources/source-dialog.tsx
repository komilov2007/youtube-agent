"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/features/shared/field-error";
import { humanize } from "@/lib/utils/format";

import { createContentSource } from "./actions";
import {
  contentSourceSchema,
  licenseStatuses,
  licenseTypes,
  sourceTypes,
  type ContentSourceInput,
} from "./schema";

const defaults: ContentSourceInput = {
  name: "",
  sourceUrl: "",
  sourceType: "youtube",
  licenseType: "unknown",
  licenseStatus: "pending",
  attributionText: "",
  evidenceUrl: "",
};

export function SourceDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContentSourceInput>({
    resolver: zodResolver(contentSourceSchema),
    defaultValues: defaults,
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaults);
      setServerMessage(null);
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (isPending) return;
    setServerMessage(null);
    startTransition(async () => {
      try {
        const result = await createContentSource(values);
        if (!result.ok) {
          setServerMessage(result.message);
          for (const [field, messages] of Object.entries(
            result.fieldErrors ?? {},
          )) {
            const message = messages?.[0];
            if (message)
              setError(field as keyof ContentSourceInput, { message });
          }
          return;
        }

        toast.success(result.message);
        reset(defaults);
        setOpen(false);
      } catch {
        setServerMessage(
          "The request could not be completed. Check your connection and try again.",
        );
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add source
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a licensed source</DialogTitle>
          <DialogDescription>
            Record origin and licensing evidence. The application will not
            download content in this phase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {serverMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{serverMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source-name">Source name</Label>
              <Input
                id="source-name"
                placeholder="Partner archive"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "source-name-error" : undefined}
                disabled={isPending}
                {...register("name")}
              />
              <FieldError
                id="source-name-error"
                message={errors.name?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-type">Source type</Label>
              <Controller
                name="sourceType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="source-type"
                      className="w-full"
                      aria-invalid={Boolean(errors.sourceType)}
                      aria-describedby={
                        errors.sourceType ? "source-type-error" : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypes.map((value) => (
                        <SelectItem key={value} value={value}>
                          {humanize(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="source-type-error"
                message={errors.sourceType?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-url">Source URL</Label>
            <Input
              id="source-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/original-video"
              aria-invalid={Boolean(errors.sourceUrl)}
              aria-describedby={
                errors.sourceUrl ? "source-url-error" : undefined
              }
              disabled={isPending}
              {...register("sourceUrl")}
            />
            <FieldError
              id="source-url-error"
              message={errors.sourceUrl?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="license-type">License type</Label>
              <Controller
                name="licenseType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="license-type"
                      className="w-full"
                      aria-invalid={Boolean(errors.licenseType)}
                      aria-describedby={
                        errors.licenseType ? "license-type-error" : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseTypes.map((value) => (
                        <SelectItem key={value} value={value}>
                          {humanize(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="license-type-error"
                message={errors.licenseType?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license-status">License status</Label>
              <Controller
                name="licenseStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="license-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.licenseStatus)}
                      aria-describedby={
                        errors.licenseStatus
                          ? "license-status-error"
                          : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseStatuses.map((value) => (
                        <SelectItem key={value} value={value}>
                          {humanize(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="license-status-error"
                message={errors.licenseStatus?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attribution-text">Attribution text</Label>
            <Textarea
              id="attribution-text"
              placeholder="Credit the creator and link to the original work."
              aria-invalid={Boolean(errors.attributionText)}
              aria-describedby={
                errors.attributionText ? "attribution-error" : undefined
              }
              disabled={isPending}
              {...register("attributionText")}
            />
            <FieldError
              id="attribution-error"
              message={errors.attributionText?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence-url">License evidence URL</Label>
            <Input
              id="evidence-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/license-or-permission"
              aria-invalid={Boolean(errors.evidenceUrl)}
              aria-describedby={
                errors.evidenceUrl ? "evidence-url-error" : undefined
              }
              disabled={isPending}
              {...register("evidenceUrl")}
            />
            <FieldError
              id="evidence-url-error"
              message={errors.evidenceUrl?.message}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : null}
              {isPending ? "Saving…" : "Save source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
