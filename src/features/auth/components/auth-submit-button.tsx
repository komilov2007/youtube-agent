import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

type AuthSubmitButtonProps = {
  children: ReactNode;
  pending: boolean;
};

export function AuthSubmitButton({ children, pending }: AuthSubmitButtonProps) {
  return (
    <button
      aria-disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40 flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition-colors outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {pending ? "Please wait…" : children}
    </button>
  );
}
