"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { humanize } from "@/lib/utils/format";

type RouteFilterProps = {
  label: string;
  queryKey: string;
  value: string;
  options: readonly string[];
};

export function RouteFilter({
  label,
  queryKey,
  value,
  options,
}: RouteFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const id = `${queryKey}-filter`;

  function updateFilter(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue === "all") params.delete(queryKey);
    else params.set(queryKey, nextValue);

    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname),
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Select value={value} onValueChange={updateFilter} disabled={isPending}>
        <SelectTrigger id={id} className="w-44" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option === "all"
                ? `All ${label.toLowerCase()}`
                : humanize(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
