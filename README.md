# YouTube Content Agent

YouTube Content Agent is a multi-tenant content-operations workspace. Phase 1 establishes the secure application foundation: Supabase email/password authentication, an owner-isolated PostgreSQL schema, a responsive SaaS dashboard, validated server actions, automated quality checks, and a Vercel-compatible deployment model.

This release records planning and workflow metadata only. It does **not** connect to YouTube, publish or download media, contact Telegram, generate content with AI, process video, or run background automation.

## Project status

- Application phase: **Phase 1 foundation**
- Database rollout: **not executed from this repository**. The migration is present, but no Supabase credentials were supplied. Apply it to your project before registering users or using dashboard data features.
- Runtime model: Next.js request/response workloads suitable for Vercel; no custom server, persistent worker, or local filesystem dependency
- Verification: use the commands in [Quality checks](#quality-checks) or the GitHub Actions workflow for the current revision

## Phase 1 scope

| Area            | What is implemented                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication  | Email/password registration and login, email-confirmation callback, logout, SSR-compatible cookie sessions, session refresh, protected-route redirects, and authenticated-user redirects away from auth pages |
| Dashboard shell | Collapsible desktop sidebar, mobile navigation dialog, header, route title, breadcrumbs, account menu, notification placeholder, and light/dark/system themes                                                 |
| Dashboard       | Real per-user counts for channels, queued items, published records, and failed records; recent persisted activity; stored automation setting; empty state                                                     |
| Channels        | List and create local YouTube channel records; no YouTube account connection                                                                                                                                  |
| Sources         | List and create source-provenance records with URL, type, license, attribution, evidence, and validation; no media download                                                                                   |
| Queue           | List, status-filter, and create content records with optional channel/source assignment and scheduling metadata; no publisher or scheduler runs                                                               |
| Analytics       | Honest integration-readiness and empty states; no fabricated charts or statistics                                                                                                                             |
| Logs            | Persisted activity list and level filter                                                                                                                                                                      |
| Settings        | Profile name, timezone, language, daily publish limit, and stored automation toggle                                                                                                                           |
| Operations      | Health route, optional guarded development seed, GitHub Actions CI, and Git-to-Vercel deployment support                                                                                                      |

Application routes:

| Route            | Access        | Purpose                                                                    |
| ---------------- | ------------- | -------------------------------------------------------------------------- |
| `/`              | Public        | Redirects to `/login` or `/dashboard` according to the verified session    |
| `/login`         | Public-only   | Email/password sign-in                                                     |
| `/register`      | Public-only   | Email/password account creation                                            |
| `/auth/callback` | Public        | Exchanges the Supabase email-confirmation code for a cookie-backed session |
| `/dashboard`     | Authenticated | Workspace summary and recent activity                                      |
| `/channels`      | Authenticated | Local channel records                                                      |
| `/sources`       | Authenticated | Source and licensing records                                               |
| `/queue`         | Authenticated | Approval and scheduling metadata                                           |
| `/analytics`     | Authenticated | Future analytics integration boundary                                      |
| `/logs`          | Authenticated | Workspace event history                                                    |
| `/settings`      | Authenticated | Profile and automation defaults                                            |
| `/api/health`    | Public        | Non-cached service-health JSON without configuration or secrets            |

All user-facing route groups include loading and error boundaries. Data-backed pages provide truthful empty states, and dashboard tables remain usable on narrow screens through responsive overflow handling.

## Deferred integrations

The following are possible later-phase work, not active features or delivery promises:

- YouTube OAuth, secure token lifecycle, channel synchronization, upload scheduling, publishing, quota handling, and retry-safe jobs
- YouTube Analytics authorization, ingestion, storage, and source-backed reporting
- Telegram delivery for operational notifications and reports
- Third-party video or source discovery with licensing and provenance controls
- AI-assisted discovery, ideation, scripting, metadata, or other content generation with human review and auditability
- Media storage, transcoding, rendering, and other video processing after a compliant execution architecture is designed

Do not add YouTube, Telegram, AI-provider, or media-processing credentials for Phase 1. There are no production adapters or fake responses for these systems.

## Technology

- Bun 1.3.13 and `bun.lock`
- Next.js 16.2 App Router, React 19.2, and strict TypeScript
- Tailwind CSS 4 and locally owned shadcn/ui-style primitives built on Radix UI
- Supabase Auth, Supabase SSR, Supabase JavaScript client, and hosted PostgreSQL
- Zod, React Hook Form, TanStack Query, Sonner, Lucide React, and date-fns
- Vitest, React Testing Library, and Playwright
- GitHub Actions and Vercel

Initial reads use Server Components and feature-level query modules. Interactive forms use Client Components and typed Server Actions. Zustand is intentionally absent because Phase 1 has no global client state that warrants it.

## Repository layout

```text
.
|-- .github/
|   |-- ISSUE_TEMPLATE/
|   |-- pull_request_template.md
|   `-- workflows/ci.yml
|-- e2e/
|   `-- auth.smoke.spec.ts
|-- scripts/
|   |-- prepare-e2e.ts
|   `-- seed.ts
|-- src/
|   |-- app/
|   |   |-- (auth)/                 # login/register UI and boundaries
|   |   |-- (dashboard)/            # protected workspace routes and boundaries
|   |   |-- api/health/             # public health route
|   |   `-- auth/callback/          # Supabase confirmation-code exchange
|   |-- components/
|   |   |-- layout/                 # shell, sidebar, header, navigation
|   |   |-- providers/              # theme, query, and toast providers
|   |   |-- shared/
|   |   `-- ui/                     # reusable UI primitives
|   |-- features/                    # feature queries, actions, schemas, and UI
|   |-- lib/
|   |   |-- auth/
|   |   |-- env/
|   |   |-- logger/
|   |   |-- supabase/
|   |   |-- utils/
|   |   `-- validation/
|   |-- types/                       # database and action-result contracts
|   `-- proxy.ts                     # session refresh and route protection
|-- supabase/
|   `-- migrations/
|       `-- 20260801000000_initial_schema.sql
|-- .env.example
|-- package.json
|-- playwright.config.ts
|-- vitest.config.ts
`-- bun.lock
```

## Prerequisites

- [Bun](https://bun.sh/docs/installation) 1.3.13, matching `package.json` and CI
- Git
- A hosted [Supabase](https://supabase.com/dashboard) project
- The Supabase project reference and database password if using the CLI migration path
- GitHub and Vercel accounts for deployment

Docker is neither required nor used. The migration instructions below target a hosted Supabase project.

## Local setup

1. Install the locked dependencies from the repository root:

   ```powershell
   bun install --frozen-lockfile
   ```

2. Create the ignored local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Replace every placeholder needed for your workflow using the [environment variable reference](#environment-variables). Never commit `.env.local`.

4. Create the Supabase project and apply the migration as described in [Supabase setup](#supabase-setup). Apply the migration before creating the first Auth user so profile provisioning is active; existing email users are also backfilled when the migration runs.

5. Start the development server:

   ```powershell
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000). Register a real account or sign in with an existing Supabase Auth account.

## Environment variables

Public variables are embedded in browser bundles. Server and seed values must never use a `NEXT_PUBLIC_` prefix.

| Variable                        | Exposure    | Required when                                                    | Value                                                                                                                                                              |
| ------------------------------- | ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`           | Public      | Application runtime                                              | Exact origin with no path. Use `http://localhost:3000` locally and the canonical HTTPS origin in production. Registration builds its callback URL from this value. |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public      | Application runtime                                              | Hosted project URL, such as `https://<project-ref>.supabase.co`.                                                                                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public      | Application runtime                                              | Supabase publishable key; a legacy `anon` key also works while enabled. The variable name is retained by the current code.                                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only | Privileged admin client and development seed                     | Supabase secret key or enabled legacy `service_role` key. It bypasses RLS and must never reach browser code.                                                       |
| `CRON_SECRET`                   | Server only | Server environment validation and future authenticated cron work | A random value of at least 16 characters. No cron route consumes it in Phase 1.                                                                                    |
| `SUPABASE_URL`                  | Seed only   | `bun run db:seed`                                                | The same hosted project URL used by the application.                                                                                                               |
| `SEED_ENVIRONMENT`              | Seed only   | `bun run db:seed`                                                | Must be exactly `development`; the seed refuses to start without this explicit safety gate.                                                                        |
| `SEED_USER_ID`                  | Seed only   | `bun run db:seed`                                                | UUID of an existing Supabase `auth.users` record.                                                                                                                  |

Supabase exposes current publishable/secret keys under **Project Settings -> API Keys** and also surfaces connection values in the project's **Connect** dialog. See [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

Generate a suitable `CRON_SECRET` locally with Bun:

```powershell
bun -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

The public and server schemas report scoped validation errors. Server-secret validation is lazy: ordinary user-scoped SSR requests use the public project URL/key, while the privileged admin client validates `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` when invoked. The seed has a separate schema and requires all four seed inputs.

For Vercel, configure the three public variables for Production and Preview as appropriate. Store `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` as encrypted server-only values. Do not configure `SUPABASE_URL`, `SEED_ENVIRONMENT`, or `SEED_USER_ID` in Vercel because the seed must not run there.

## Supabase setup

### 1. Create and configure the project

1. Create a hosted Supabase project and retain its project reference and database password securely.
2. From **Connect** or **Project Settings -> API Keys**, copy the project URL and publishable key into the corresponding public variables.
3. Copy a server secret key into `SUPABASE_SERVICE_ROLE_KEY` only if you will run the development seed or another trusted admin-only workflow.
4. In **Authentication -> Providers -> Email**, enable email/password authentication. Decide whether email confirmation is required for your environment.
5. Apply the one migration using exactly one of the following methods.

### 2A. Apply with the Supabase SQL Editor

1. Open **SQL Editor -> New query** in the target project.
2. Open [`supabase/migrations/20260801000000_initial_schema.sql`](supabase/migrations/20260801000000_initial_schema.sql), copy the complete file into the editor, and select **Run**.
3. Confirm that the six application tables appear and show RLS enabled.

This method does not populate CLI migration history. If you later adopt `db push`, reconcile the remote migration history before applying the same file through the CLI.

### 2B. Apply with the Supabase CLI through Bun

The repository contains the migration directory but no generated Supabase CLI configuration. Initialize it once, authenticate, and link the intended hosted project:

```powershell
bunx supabase init
bunx supabase login
bunx supabase link --project-ref <project-ref>
```

The link command prompts for the remote database password. Do not place that password in the repository or shell history. Preview and then apply pending migrations:

```powershell
bunx supabase db push --dry-run
bunx supabase db push
```

`db push` records the migration version in the remote migration-history table. Review the linked project carefully before the final command. Do not use a remote reset against a production project.

See the official [Supabase CLI workflow](https://supabase.com/docs/guides/local-development/cli-workflows) and [`db push` reference](https://supabase.com/docs/reference/cli/supabase-db-push).

### Schema and RLS behavior

The migration creates UUID-based tables:

| Table             | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `profiles`        | Private profile linked one-to-one to `auth.users`              |
| `channels`        | User-owned local publishing destinations                       |
| `content_sources` | Source provenance, license state, attribution, and evidence    |
| `content_items`   | Approval, queue, scheduling, and eventual publication metadata |
| `automation_logs` | User-scoped structured activity events with JSON metadata      |
| `app_settings`    | One settings row per user                                      |

The migration also creates constrained enums, ownership and filter indexes, `updated_at` triggers, a new-user profile trigger, an Auth email-sync trigger, and a cross-tenant reference guard for queue items.

RLS is enabled and forced on all six application tables:

- Anonymous table access is revoked.
- Authenticated users can select, insert, update, and delete only rows whose `user_id` equals `auth.uid()`; profiles use `id = auth.uid()`.
- A user cannot assign a content item to another user's channel or source. Server actions verify ownership, RLS hides foreign rows, and a database trigger also rejects cross-owner references.
- Profile email and role remain database/trusted-server controlled. Browser-authenticated users can update only `full_name` and `avatar_url` columns.
- The server secret/service-role credential bypasses RLS. It is reserved for trusted server-only administration and the guarded development seed.

RLS is the authorization boundary; an exposed public key alone does not grant access to another user's data. Never weaken the policies to compensate for application bugs.

## Authentication URL configuration

Open **Supabase Dashboard -> Authentication -> URL Configuration**. The app supplies `/auth/callback?next=/dashboard` when registering an account.

Set **Site URL** as follows:

- Before deployment, a local-only project may use `http://localhost:3000`.
- For production, replace it with the exact canonical origin, for example `https://<production-domain>`.

Add these **Redirect URLs**:

```text
http://localhost:3000/auth/callback
https://<production-domain>/auth/callback
https://*-<team-or-account-slug>.vercel.app/auth/callback
```

The final pattern admits Vercel-generated preview hosts for that account. Use the real Vercel team or account slug, keep the exact callback path, and retain the exact production URL separately. Refer to [Supabase redirect URL guidance](https://supabase.com/docs/guides/auth/redirect-urls).

`NEXT_PUBLIC_APP_URL` controls the callback origin generated by this codebase:

- Local: `http://localhost:3000`
- Production: the exact canonical production origin
- Preview: an exact branch/deployment origin admitted by the Supabase preview pattern

For preview registration flows, add a branch-specific Preview override for `NEXT_PUBLIC_APP_URL` in Vercel and redeploy that branch. The Supabase wildcard only allows a URL; it does not change the origin the application generates. Preview deployments without an exact override will use the generic Preview value you configured and can send confirmation back to that origin.

## Development seed

The optional seed creates deterministic demo records only for a real, existing Auth user. It does not create a login or use fake credentials.

1. Apply the database migration.
2. Register a user through the app and complete email confirmation, or create an email user through **Supabase Dashboard -> Authentication -> Users**.
3. Copy that user's UUID into `SEED_USER_ID` in `.env.local`.
4. Set `SEED_ENVIRONMENT=development` explicitly.
5. Set `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` to the same project.
6. Run:

   ```powershell
   bun run db:seed
   ```

The script verifies the explicit development gate and UUID through the Supabase Admin API, then upserts a local channel, licensed source, queue examples, logs, and disabled settings for that user. Deterministic IDs make it safe to rerun in development. It refuses to execute without `SEED_ENVIRONMENT=development` or if `NODE_ENV`, `VERCEL_ENV`, or `SUPABASE_ENV` identifies production. Keep the server secret out of logs, screenshots, browser code, and source control.

## Commands

| Command                | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `bun run dev`          | Start the development server                                                    |
| `bun run build`        | Create a production build                                                       |
| `bun run start`        | Serve an existing production build                                              |
| `bun run lint`         | Run ESLint with zero warnings allowed                                           |
| `bun run typecheck`    | Run strict TypeScript checking without emitting files                           |
| `bun run test`         | Run the Vitest suite once                                                       |
| `bun run test:watch`   | Run Vitest in watch mode                                                        |
| `bun run test:e2e`     | Clear generated Next output, then run the Playwright authentication smoke tests |
| `bun run format`       | Format supported files with Prettier                                            |
| `bun run format:check` | Check formatting without rewriting files                                        |
| `bun run check`        | Run lint, typecheck, and unit tests in sequence                                 |
| `bun run db:seed`      | Run the guarded development seed for `SEED_USER_ID`                             |

## Quality checks

Run the same core checks used by CI:

```powershell
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
```

Install the Chromium test browser once on a new workstation, then run the smoke suite:

```powershell
bunx playwright install chromium
bun run test:e2e
```

The unit suite covers environment validation, login and registration schemas, source validation, queue validation, redirect safety, formatting utilities, and the health route. The Playwright smoke suite checks that the login page renders and an unauthenticated dashboard request redirects to login.

## GitHub and CI

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It grants read-only repository permissions, cancels superseded runs for the same ref, sets up Bun 1.3.13, and executes:

```text
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
```

CI uses syntactically valid, non-secret Supabase placeholders so validation and compilation do not need a live project. It does not run migrations, seed data, contact Supabase, or deploy the app. The Playwright smoke suite is currently a separate local/manual command.

### Publish this repository to GitHub

This checkout is already a Git repository on `main`, the Phase 1 foundation is committed, and no remote is configured. Create an empty GitHub repository without generated starter files, replace the placeholders below, then run:

```powershell
git status
git remote add origin https://github.com/<account>/<repository>.git
git push -u origin main
```

If another collaborator adds `origin` first, inspect it with `git remote -v` and use `git remote set-url origin <repository-url>` only when the existing URL is incorrect. Review staged files before committing; `.env.local` and other `.env*` files must remain excluded, with only `.env.example` committed.

## Deploy GitHub to Vercel

1. Push the repository to GitHub with `main` as the production branch.
2. In Vercel, choose **Add New -> Project**, connect GitHub, and import the repository.
3. Keep **Framework Preset** set to **Next.js** and **Root Directory** set to the repository root.
4. Vercel detects `bun.lock`. Set the install command to `bun install --frozen-lockfile` and the build command to `bun run build`; keep the framework's default output setting.
5. Add the environment variables from [Environment variables](#environment-variables). Scope the canonical `NEXT_PUBLIC_APP_URL` to Production and use branch-specific Preview overrides when testing registration callbacks. Do not add seed-only variables.
6. Select a unique Vercel project name. Its default production origin is normally `https://<project-name>.vercel.app`; a custom domain may replace it.
7. Deploy. Open **Project -> Settings -> Domains**, copy the exact primary production origin, and make it the Production value of `NEXT_PUBLIC_APP_URL`.
8. Set that same exact origin as Supabase **Site URL**, add its `/auth/callback` URL to the redirect allowlist, and add the scoped Vercel preview pattern described above.
9. Redeploy after changing environment variables. Confirm `/api/health`, registration/email confirmation, login, logout, and protected-route redirects against the deployed origin.
10. In **Project -> Settings -> Environments -> Production -> Branch Tracking**, confirm `main` is the production branch.

After the Git integration is active, non-production branch pushes create Preview deployments and pushes/merges to `main` create Production deployments. No `vercel.json`, custom server, virtual server, process manager, container, or long-running worker is required. See [Vercel Git deployments](https://vercel.com/docs/git) and [Vercel environment scopes](https://vercel.com/docs/environment-variables).

## Security notes

- `.gitignore` excludes all `.env*` files except `.env.example`, along with build and test artifacts.
- The public Supabase key identifies the client and is expected to be visible. Access control comes from verified Auth sessions plus RLS.
- Supabase secret and legacy service-role keys bypass RLS. Import them only in server-only code and rotate immediately if exposed.
- The browser and SSR clients use the low-privilege public key. The privileged client disables session persistence and is isolated in a server-only module.
- Server mutations validate unknown input with Zod, verify the current user, derive `user_id` from that verified user, and return typed results.
- Safe redirect handling rejects external and protocol-relative destinations.
- Queue ownership is enforced in application checks, RLS, and a database trigger.
- License fields are an audit trail, not independent legal verification. Operators remain responsible for rights and attribution.
- The health endpoint returns status, service name, and timestamp only.

## Current limitations

- The SQL migration has not been applied to a hosted project from this checkout because no credentials were provided.
- Channel rows are local records; YouTube OAuth and channel synchronization do not exist.
- Queue scheduling is stored metadata. No scheduler, uploader, retry worker, or publishing job runs.
- The automation toggle stores user intent only and starts no background process.
- Analytics contains no external metrics, and notifications are a UI placeholder.
- Telegram, AI discovery/generation, third-party source discovery, media downloads, and video processing are absent.
- Phase 1 provides create/list flows for channels, sources, and queue items; broader editing and deletion UI is not included even though owner-scoped database policies support those operations.
- The Playwright suite is a basic unauthenticated smoke test and does not exercise a real hosted Supabase sign-in.
- Preview email-confirmation callbacks require an exact Preview `NEXT_PUBLIC_APP_URL` override for the branch/deployment being tested.
- There is no monetization or performance guarantee.

## Roadmap candidates

Future work should be separately designed, reviewed, and authorized. A reasonable sequence is:

1. YouTube OAuth with encrypted credential handling, rotation/revocation, channel synchronization, and audit logs.
2. Idempotent publishing jobs with quota awareness, scheduling, retries, and explicit human approval gates.
3. YouTube Analytics storage and reporting based only on authorized API data.
4. Telegram notification/report delivery with per-user consent and secret isolation.
5. Rights-aware source discovery and AI-assisted generation with provenance, moderation, and human review.
6. A dedicated media-processing architecture only after storage, compute, licensing, observability, and cost controls are defined.

None of these integrations should be represented as connected until its real provider flow, security model, failure handling, and tests are implemented.
