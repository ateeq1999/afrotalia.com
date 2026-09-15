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

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

## Project Structure

```
afrotalia/
├── apps/
│   └── web/         # Fullstack application (React + TanStack Start)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

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
