import { Clapperboard, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background min-h-svh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]">
      <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.28),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(14,165,233,0.16),transparent_32%)]"
        />
        <Link
          className="relative flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          href="/"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Clapperboard aria-hidden="true" className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">
            YouTube Content Agent
          </span>
        </Link>

        <div className="relative max-w-xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.18em] text-indigo-300 uppercase">
              Content operations, organized
            </p>
            <h2 className="text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl">
              Build a dependable workflow before you automate it.
            </h2>
            <p className="max-w-lg text-base leading-7 text-slate-300">
              Keep channels, licensed sources, approvals, and publishing plans
              in one secure workspace designed for responsible growth.
            </p>
          </div>

          <ul className="grid gap-4 text-sm text-slate-200">
            <li className="flex items-center gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-indigo-300"
              />
              Supabase-backed accounts and isolated workspace data
            </li>
            <li className="flex items-center gap-3">
              <Sparkles aria-hidden="true" className="size-5 text-indigo-300" />
              A production foundation ready for future automation
            </li>
          </ul>
        </div>

        <p className="relative text-xs leading-5 text-slate-400">
          Phase 1 establishes the secure foundation. Publishing integrations are
          intentionally not connected yet.
        </p>
      </aside>

      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
