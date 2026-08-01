import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retry?: () => void;
};

function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this view. Try again, and contact support if the problem continues.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[22rem] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="border-destructive/20 bg-destructive/8 text-destructive mx-auto mb-5 flex size-12 items-center justify-center rounded-xl border">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {description}
        </p>
        {retry ? (
          <Button className="mt-6" variant="outline" onClick={retry}>
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { ErrorState };
export type { ErrorStateProps };
