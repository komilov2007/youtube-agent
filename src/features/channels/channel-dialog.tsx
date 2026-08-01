"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, TvMinimalPlay } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { FieldError } from "@/features/shared/field-error";

import { createChannel } from "./actions";
import { channelSchema, type ChannelInput } from "./schema";

export function ChannelDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChannelInput>({
    resolver: zodResolver(channelSchema),
    defaultValues: { name: "", platform: "youtube" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setServerMessage(null);
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (isPending) return;
    setServerMessage(null);
    startTransition(async () => {
      try {
        const result = await createChannel(values);
        if (!result.ok) {
          setServerMessage(result.message);
          const nameError = result.fieldErrors?.name?.[0];
          if (nameError) setError("name", { message: nameError });
          return;
        }

        toast.success(result.message);
        reset();
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
          Add channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel record</DialogTitle>
          <DialogDescription>
            Create the local destination record now. YouTube OAuth and
            publishing are intentionally deferred to a later phase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {serverMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{serverMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <Input
              id="channel-name"
              placeholder="Editorial highlights"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "channel-name-error" : undefined}
              disabled={isPending}
              {...register("name")}
            />
            <FieldError
              id="channel-name-error"
              message={errors.name?.message}
            />
          </div>

          <div className="bg-muted/25 flex items-center gap-3 rounded-lg border p-3">
            <TvMinimalPlay
              className="text-muted-foreground size-5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">YouTube</p>
              <p className="text-muted-foreground text-xs">
                Platform connection not configured yet
              </p>
            </div>
          </div>
          <input type="hidden" value="youtube" {...register("platform")} />

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
              {isPending ? "Creating…" : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
