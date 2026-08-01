"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { signInAction } from "../actions";
import { loginSchema, type LoginInput } from "../schemas";
import { AuthFormField } from "./auth-form-field";
import { AuthMessage } from "./auth-message";
import { AuthSubmitButton } from "./auth-submit-button";

type LoginFormProps = {
  initialError?: string;
  next?: string;
};

export function LoginForm({ initialError, next }: LoginFormProps) {
  const router = useRouter();
  const idPrefix = useId();
  const submissionLock = useRef(false);
  const [serverError, setServerError] = useState(initialError);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  const submitValues = handleSubmit(async (values) => {
    setServerError(undefined);

    try {
      const result = await signInAction(values, next);

      if (!result.success) {
        setServerError(result.message);

        const emailError = result.fieldErrors?.email?.[0];
        const passwordError = result.fieldErrors?.password?.[0];

        if (emailError) {
          setError("email", { message: emailError, type: "server" });
        }
        if (passwordError) {
          setError("password", { message: passwordError, type: "server" });
        }
        return;
      }

      router.replace(result.redirectTo ?? "/dashboard");
      router.refresh();
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

  return (
    <form
      aria-busy={isSubmitting}
      className="space-y-5"
      noValidate
      onSubmit={onSubmit}
    >
      {serverError ? <AuthMessage>{serverError}</AuthMessage> : null}

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
        autoComplete="current-password"
        disabled={isSubmitting}
        error={errors.password?.message}
        id={`${idPrefix}-password`}
        label="Password"
        placeholder="Enter your password"
        registration={register("password")}
        type="password"
      />

      <AuthSubmitButton pending={isSubmitting}>Sign in</AuthSubmitButton>
    </form>
  );
}
