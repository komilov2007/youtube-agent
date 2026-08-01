"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { licenseStatuses } from "@/features/sources/schema";
import { humanize } from "@/lib/utils/format";
import { wallTimeToIso } from "@/lib/utils/time-zone";

import { createContentItem } from "./actions";
import {
  contentItemFormSchema,
  creatableContentStatuses,
  type ContentItemInput,
} from "./schema";

type Option = { id: string; name: string };

type ContentItemDialogProps = {
  channels: Option[];
  sources: Option[];
  timeZone: string;
};

const defaults: ContentItemInput = {
  title: "",
  description: "",
  channelId: "",
  sourceId: "",
  status: "draft",
  scheduledAt: "",
  sourceUrl: "",
  licenseStatus: "pending",
};

export function ContentItemDialog({
  channels,
  sources,
  timeZone,
}: ContentItemDialogProps) {
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
  } = useForm<ContentItemInput>({
    resolver: zodResolver(contentItemFormSchema),
    defaultValues: defaults,
  });
  const selectedStatus = useWatch({ control, name: "status" });

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
      const scheduledAt =
        values.status === "scheduled" && values.scheduledAt
          ? wallTimeToIso(values.scheduledAt, timeZone)
          : "";
      if (values.status === "scheduled" && !scheduledAt) {
        setError("scheduledAt", {
          message: `Choose a valid time in ${timeZone}.`,
        });
        return;
      }

      try {
        const result = await createContentItem({
          ...values,
          scheduledAt,
        });
        if (!result.ok) {
          setServerMessage(result.message);
          for (const [field, messages] of Object.entries(
            result.fieldErrors ?? {},
          )) {
            const message = messages?.[0];
            if (message) setError(field as keyof ContentItemInput, { message });
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
          Create item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a content item</DialogTitle>
          <DialogDescription>
            Prepare a queue record for review or scheduling. No video is
            downloaded, rendered, or published.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {serverMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{serverMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="content-title">Title</Label>
            <Input
              id="content-title"
              placeholder="Weekly product briefing"
              maxLength={100}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "content-title-error" : undefined
              }
              disabled={isPending}
              {...register("title")}
            />
            <FieldError
              id="content-title-error"
              message={errors.title?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-description">Description</Label>
            <Textarea
              id="content-description"
              placeholder="Internal notes and the future YouTube description."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "content-description-error" : undefined
              }
              disabled={isPending}
              {...register("description")}
            />
            <FieldError
              id="content-description-error"
              message={errors.description?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="queue-channel">Destination channel</Label>
              <Controller
                name="channelId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="queue-channel"
                      className="w-full"
                      aria-invalid={Boolean(errors.channelId)}
                      aria-describedby={
                        errors.channelId ? "queue-channel-error" : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No channel yet</SelectItem>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="queue-channel-error"
                message={errors.channelId?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queue-source">Licensed source</Label>
              <Controller
                name="sourceId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="queue-source"
                      className="w-full"
                      aria-invalid={Boolean(errors.sourceId)}
                      aria-describedby={
                        errors.sourceId ? "queue-source-error" : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No source yet</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="queue-source-error"
                message={errors.sourceId?.message}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-status">Workflow status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="content-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.status)}
                      aria-describedby={
                        errors.status ? "content-status-error" : undefined
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creatableContentStatuses.map((value) => (
                        <SelectItem key={value} value={value}>
                          {humanize(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="content-status-error"
                message={errors.status?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-license-status">License status</Label>
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
                      id="content-license-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.licenseStatus)}
                      aria-describedby={
                        errors.licenseStatus
                          ? "content-license-error"
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
                id="content-license-error"
                message={errors.licenseStatus?.message}
              />
            </div>
          </div>

          {selectedStatus === "scheduled" ? (
            <div className="space-y-2">
              <Label htmlFor="scheduled-at">Scheduled date and time</Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                aria-invalid={Boolean(errors.scheduledAt)}
                aria-describedby={
                  errors.scheduledAt
                    ? "scheduled-at-help scheduled-at-error"
                    : "scheduled-at-help"
                }
                disabled={isPending}
                {...register("scheduledAt")}
              />
              <FieldError
                id="scheduled-at-error"
                message={errors.scheduledAt?.message}
              />
              <p
                id="scheduled-at-help"
                className="text-muted-foreground text-xs"
              >
                Interpreted in {timeZone.replaceAll("_", " ")} and stored as an
                exact UTC instant.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="content-source-url">Original media URL</Label>
            <Input
              id="content-source-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/original"
              aria-invalid={Boolean(errors.sourceUrl)}
              aria-describedby={
                errors.sourceUrl ? "content-source-url-error" : undefined
              }
              disabled={isPending}
              {...register("sourceUrl")}
            />
            <FieldError
              id="content-source-url-error"
              message={errors.sourceUrl?.message}
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
              {isPending ? "Creating…" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
