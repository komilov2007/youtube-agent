"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { signUpAction } from "../actions";
import { registerSchema, type RegisterInput } from "../schemas";
import { AuthFormField } from "./auth-form-field";
import { AuthMessage } from "./auth-message";
import { AuthSubmitButton } from "./auth-submit-button";

export function RegisterForm() {
  const router = useRouter();
  const idPrefix = useId();
  const submissionLock = useRef(false);
  const [serverError, setServerError] = useState<string>();
  const [confirmationMessage, setConfirmationMessage] = useState<string>();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterInput>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      fullName: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const submitValues = handleSubmit(async (values) => {
    setServerError(undefined);

    try {
      const result = await signUpAction(values);

      if (!result.success) {
        setServerError(result.message);

        const fullNameError = result.fieldErrors?.fullName?.[0];
        const emailError = result.fieldErrors?.email?.[0];
        const passwordError = result.fieldErrors?.password?.[0];
        const confirmationError = result.fieldErrors?.confirmPassword?.[0];

        if (fullNameError) {
          setError("fullName", { message: fullNameError, type: "server" });
        }
        if (emailError) {
          setError("email", { message: emailError, type: "server" });
        }
        if (passwordError) {
          setError("password", { message: passwordError, type: "server" });
        }
        if (confirmationError) {
          setError("confirmPassword", {
            message: confirmationError,
            type: "server",
          });
        }
        return;
      }

      if (result.redirectTo) {
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }

      setConfirmationMessage(result.message);
    } catch {
      setServerError(
        "The authentication service is temporarily unavailable. Please try again.",
      );
    }
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (submissionLock.current) {
      event.preventDefault();
      return;
    }

    submissionLock.current = true;
    try {
      await submitValues(event);
    } finally {
      submissionLock.current = false;
    }
  }

  if (confirmationMessage) {
    return (
      <div className="space-y-5">
        <div className="bg-success/10 ring-success/20 mx-auto flex size-12 items-center justify-center rounded-full ring-1">
          <CheckCircle2 aria-hidden="true" className="text-success size-6" />
        </div>
        <AuthMessage tone="success">{confirmationMessage}</AuthMessage>
        <p className="text-muted-foreground text-center text-sm leading-6">
          The confirmation link expires for your security. If it does, return
          here and create the account again.
        </p>
        <Link
          className="border-input bg-background hover:bg-accent focus-visible:ring-ring/40 flex h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-semibold shadow-sm transition-colors outline-none focus-visible:ring-4"
          href="/login"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      aria-busy={isSubmitting}
      className="space-y-5"
      noValidate
      onSubmit={onSubmit}
    >
      {serverError ? <AuthMessage>{serverError}</AuthMessage> : null}

      <AuthFormField
        autoComplete="name"
        disabled={isSubmitting}
        error={errors.fullName?.message}
        id={`${idPrefix}-name`}
        label="Full name"
        placeholder="Your name"
        registration={register("fullName")}
      />

      <AuthFormField
        autoCapitalize="none"
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        id={`${idPrefix}-email`}
        inputMode="email"
        label="Email address"
        placeholder="you@example.com"
        registration={register("email")}
        type="email"
      />

      <AuthFormField
        autoComplete="new-password"
        description="Use 8–72 characters with at least one letter and one number."
        disabled={isSubmitting}
        error={errors.password?.message}
        id={`${idPrefix}-password`}
        label="Password"
        placeholder="Create a strong password"
        registration={register("password")}
        type="password"
      />

      <AuthFormField
        autoComplete="new-password"
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        id={`${idPrefix}-confirm-password`}
        label="Confirm password"
        placeholder="Repeat your password"
        registration={register("confirmPassword")}
        type="password"
      />

      <AuthSubmitButton pending={isSubmitting}>Create account</AuthSubmitButton>
    </form>
  );
}
