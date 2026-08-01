import type { ReactNode } from "react";

type AuthMessageProps = {
  children: ReactNode;
  tone?: "error" | "success";
};

export function AuthMessage({ children, tone = "error" }: AuthMessageProps) {
  const styles =
    tone === "success"
      ? "border-success/25 bg-success/10 text-foreground"
      : "border-destructive/25 bg-destructive/10 text-foreground";

  return (
    <div
      aria-live="polite"
      className={`rounded-lg border px-3 py-2.5 text-sm leading-5 ${styles}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
