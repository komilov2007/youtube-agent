import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type AuthFormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name"
> & {
  description?: string;
  error?: string;
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
};

export function AuthFormField({
  description,
  error,
  id,
  label,
  registration,
  className,
  ...inputProps
}: AuthFormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className="space-y-2">
      <label className="text-foreground block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        {...registration}
        {...inputProps}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={`border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-lg border px-3 text-sm shadow-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
        id={id}
      />
      {description ? (
        <p
          className="text-muted-foreground text-xs leading-5"
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive text-sm" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
