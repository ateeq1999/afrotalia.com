# afrotalia

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Self, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database, then seed it (required — the apps query real tables, so an empty database 500s):

```bash
pnpm run db:migrate
pnpm run db:seed
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the fullstack application.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@afrotalia/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation (`pnpm install` runs `postinstall`, which codegens `web`, `shop`, `mnada`, and `packages/db`); run `pnpm run env:generate` manually after changing a schema. Commit schemas — they're the source of truth and are *not* gitignored — and keep secrets in ignored env files or your deployment platform. `src/env.ts` itself is generated, gitignored per-package, and must never be committed: a fresh checkout (including Vercel's) has none of them until `postinstall` runs.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Every app's schema also declares two vars for cross-subdomain auth (both optional — see [Deploying to Vercel](#deploying-to-vercel)):

- `AUTH_TRUSTED_ORIGINS` — comma-separated origins Better Auth trusts. Falls back to the app's own `BETTER_AUTH_URL` when unset, which is correct for local dev.
- `COOKIE_DOMAIN` — the parent domain the session cookie is scoped to (e.g. `.afrotalia.com`). Leave unset locally; each app runs on its own `localhost` port there, so a shared subdomain cookie doesn't apply.

## Project Structure

```
afrotalia/
├── apps/
│   ├── web/         # afrotalia.com — corporate site (React + TanStack Start)
│   ├── shop/        # shop.afrotalia.com — commerce
│   └── mnada/       # mnada.afrotalia.com — live auctions
├── packages/
│   ├── ui/          # Shared shadcn/ui components, tokens, and brand marks
│   ├── auth/         # Better Auth server config, shared across all three apps
│   ├── db/          # Drizzle schema, migrations, seed script
│   ├── core/        # Domain rules (money, auction/bid state machine) — see below
│   └── config/      # Shared tsconfig base
```

## Deploying to Vercel

Each app is its own Vercel Project bound to its own subdomain — they don't deploy as one unit. This repo is prepared for that (per-app `vercel.json`, `packages/*` have no build step so nothing needs building ahead of the app itself, and Nitro's `vercel` preset auto-detects and emits the Build Output API with zero extra config). What's *not* done for you, because it needs your Vercel account: creating the projects, setting their env vars, and attaching domains.

### 1. Create three Vercel projects from this repo

For each of `apps/web`, `apps/shop`, `apps/mnada`: import the repo as a new Vercel Project and set **Root Directory** to that app's folder (Project Settings → General). Leave "Include source files outside of the Root Directory in the Build Step" **on** — the app imports `packages/*` from outside its own folder.

Each app's `vercel.json` already sets the install/build commands to run `pnpm install` and `turbo run build --filter=<app>` from the repo root, and an `ignoreCommand` (`turbo-ignore`) so a project only rebuilds when that app's own dependency graph actually changed.

### 2. Environment variables (per project, Project Settings → Environment Variables)

| Variable | web | shop | mnada | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | same | same | same | One Postgres for all three apps. Use your provider's **pooled** connection string (e.g. Neon/Supabase PgBouncer) — serverless functions open many short-lived connections. |
| `BETTER_AUTH_SECRET` | same | same | same | **Must be identical across all three apps** — it signs the shared session cookie. Generate once (`openssl rand -base64 32`), reuse everywhere. |
| `BETTER_AUTH_URL` | `https://afrotalia.com` | `https://shop.afrotalia.com` | `https://mnada.afrotalia.com` | Each app's own production URL. |
| `AUTH_TRUSTED_ORIGINS` | same | same | same | `https://afrotalia.com,https://shop.afrotalia.com,https://mnada.afrotalia.com` |
| `COOKIE_DOMAIN` | same | same | same | `.afrotalia.com` |

`NODE_ENV` is set by Vercel automatically — don't override it.

### 3. Attach domains

`afrotalia.com` → the `web` project, `shop.afrotalia.com` → `shop`, `mnada.afrotalia.com` → `mnada` (Project Settings → Domains on each).

### 4. Migrate the database once, outside the build

Don't run `drizzle-kit migrate` from a Vercel build command — all three projects share one database, and three concurrent deploys would race to alter the same tables. Run it yourself, once, pointed at the production `DATABASE_URL`:

```bash
DATABASE_URL="<production pooled url>" pnpm --filter @afrotalia/db db:migrate
```

Re-run it after every deploy that adds a migration. Run `pnpm --filter @afrotalia/db db:seed` the same way if you want the sample auctions/admin/test-bidder data in production too — it's `INSERT ... ON CONFLICT DO NOTHING`, safe to re-run.

### Varlock: `resolved-env`, not `auto-load`

Each app's `vite.config.ts` sets `varlockVitePlugin({ ssrInjectMode: "resolved-env" })`. The default, `"auto-load"`, makes the deployed server shell out to a native `varlock` CLI binary **on every request** to resolve env vars — Vercel's function bundler only traces JS `import`/`require` calls, so that runtime `child_process` call is invisible to it and the binary never ships with the function. Every request then crashes with `Error: Unable to find varlock executable` before anything renders (`500 FUNCTION_INVOCATION_FAILED`, no useful browser-side error). `"resolved-env"` resolves env vars once at *build* time instead — when the full toolchain is guaranteed present — and bakes the values into the server bundle, so the deployed function needs no runtime binary at all.

Trade-off: this bakes `DATABASE_URL` and `BETTER_AUTH_SECRET` as plaintext into the server bundle (not sent to browsers, but present in the deployed function's source). Varlock supports `@encryptInjectedEnv` to encrypt those values in the bundle instead — see [varlock.dev/guides/encrypted-deployments](https://varlock.dev/guides/encrypted-deployments/) if you want that hardening; it wasn't set up here.

### Not done here (needs your Vercel account)

Creating the three projects, setting the table above, and attaching domains — none of that can be scripted from outside your account. `vercel whoami` in this environment is logged out and there's no Vercel MCP connection available, so none of this has been deployed or smoke-tested against real Vercel infrastructure; verify the first deploy of each app before pointing DNS at it.

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run test`: Run unit tests (currently `packages/core`)
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:seed`: Seed an admin, a funded/activated test bidder, and sample Mnada auctions
- `pnpm run db:studio`: Open database studio UI

## Domain logic (`packages/core`)

Rules that must not be re-implemented per app live in `packages/core`, not inline in a route or component:

- `@afrotalia/core` (root export): `DomainError` and the pure Mnada bid rules (`computeBidOutcome`, `minimumNextBid`, anti-snipe window/extension) — safe to import from client code, no DB dependency.
- `@afrotalia/core/mnada/place-bid`: the DB-touching `placeBid(db, params)` — locks the auction row, re-validates via `computeBidOutcome`, reserves the bidder's wallet balance, releases the previous leader's reservation, and applies an anti-snipe extension in one transaction. Server-only; imported by `apps/mnada/src/functions/bids.ts`.

Run its unit tests with `pnpm --filter @afrotalia/core test`.

### Test bidder (after `db:seed`)

- `bidder@afrotalia.com` / `BidderPass123!` — Mnada profile `ACTIVE`, wallet funded with TZS 10,000,000, ready to bid immediately.
- `admin@afrotalia.com` / `AdminPass123!` — seeded for future admin-surface work.

### Not yet built

This pass wired `packages/core` and real DB-backed bidding into Mnada (list, detail, place-bid, my-bids all hit Postgres now — no more mock data). Still outstanding per the original spec: live updates via SSE/WebSocket (currently a 4s poll), the settlement job that closes auctions past `endsAt` and applies the two-strike non-payment block, phone+OTP verification and the registration-fee payment gate, and the Shop/Web/admin surfaces.
