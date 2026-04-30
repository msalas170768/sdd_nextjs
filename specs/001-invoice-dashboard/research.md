# Research: Invoice Dashboard

**Feature**: Invoice Dashboard | **Branch**: `001-invoice-dashboard` | **Date**: 2026-04-29

## Authentication Library

**Decision**: NextAuth.js (Auth.js v5)

**Rationale**: Auth.js v5 is designed for the Next.js App Router. It exposes `auth()` as both
a middleware wrapper and a session accessor usable in Server Components, eliminating any need
for a client-side session hook in a Server Component tree. It supports a Prisma adapter for
PostgreSQL session persistence and aligns with Constitution Principle II (server-side data).

**Alternatives considered**:
- Clerk — excellent developer experience and managed infrastructure, but introduces a
  vendor dependency and monthly cost at scale. Acceptable if the project is already on Clerk.
- Custom JWT — too much implementation overhead for this scope; Auth.js abstracts it correctly.

**Resolution**: `prompts/plan.md` specified "Clerk or NextAuth.js". Defaulting to NextAuth.js
(Auth.js v5) for zero external service dependency. If Clerk is preferred, swap the adapter;
the component architecture is identical.

---

## ORM and Database

**Decision**: Prisma 7 with PostgreSQL via `@prisma/adapter-pg` driver adapter

**Rationale**: Explicitly specified in `prompts/plan.md`. Prisma 7 introduces a new
configuration architecture: the database URL is no longer placed in `prisma/schema.prisma`
but instead in `prisma.config.ts` (for `prisma db push` / migrate commands) and the runtime
`PrismaClient` is initialized with a `Pool`-backed `PrismaPg` adapter in `lib/db.ts`.

Prisma generates a fully typed client that satisfies Constitution Principle IV (strict
TypeScript) without manual type mapping. Prisma's `@db.Decimal` type maps cleanly to
PostgreSQL `NUMERIC` for monetary amounts.

**Prisma 7 config split**:
- `prisma.config.ts` — supplies `DATABASE_URL` for CLI operations (`prisma db push`, migrate)
- `lib/db.ts` — creates a `Pool` → `PrismaPg` adapter → `PrismaClient({ adapter })` at runtime
- `prisma/schema.prisma` — datasource block has only `provider = "postgresql"` (no `url`)

**Alternatives considered**:
- Drizzle ORM — lighter and also type-safe, but not requested.
- Raw SQL (pg) — type safety requires manual work; violates the spirit of Principle IV.
- Prisma 5 standard `PrismaClient` — does not align with the project's Prisma 7 dependency
  and misses the new config architecture.

---

## Data Fetching Pattern

**Decision**: `async` Server Component pages calling Prisma directly via `lib/invoices.ts`

**Rationale**: Next.js App Router allows any Server Component to `await` database calls
directly. No API layer is needed for internal server-to-server data access. This is the
simplest pattern, keeps sensitive credentials server-side, and fully complies with
Constitution Principle II. All data access is scoped to the authenticated `userId` obtained
from the Auth.js session — no data leaks across users.

**Alternatives considered**:
- Route Handlers (`/api/invoices`) — adds an unnecessary HTTP round-trip for internal calls.
- SWR / React Query in Client Components — violates Principle II (data fetching in Server
  Components only).

---

## Suspense and Skeleton Loading

**Decision**: `loading.tsx` convention (App Router) + Tailwind `animate-pulse` utilities

**Rationale**: App Router automatically wraps any `page.tsx` with a `<Suspense>` boundary
whose fallback is the co-located `loading.tsx`. This requires zero manual `<Suspense>` wrapper
code in page files. Tailwind's `animate-pulse` with `bg-gray-200` utility classes produces
accessible, styled skeleton loaders that comply with Constitution Principle III (Tailwind only).

**Alternatives considered**:
- Manual `<Suspense fallback={...}>` wrappers — equivalent outcome, more verbose, no benefit.
- Third-party skeleton libraries (react-loading-skeleton, etc.) — violates Principle III
  unless the library uses Tailwind under the hood; unnecessary given Tailwind covers the need.

---

## Route Protection / Middleware

**Decision**: `middleware.ts` at the repository root with Auth.js matcher on `/dashboard/:path*`

**Rationale**: A single middleware file covers all `/dashboard/*` routes with one
configuration. `prompts/plan.md` specifies "all server actions are protected with middleware".
The Auth.js v5 middleware pattern (`export { auth as middleware }`) integrates cleanly with
Next.js middleware and handles redirect to login for unauthenticated sessions.

**Alternatives considered**:
- Per-page `redirect()` calls in Server Components — functional but repetitive and
  error-prone; a missed redirect leaves a route unprotected.
- Route Groups with a layout-level auth check — possible but middleware is more declarative
  and enforced at the edge.

---

## Invoice List Scope

**Decision**: Return 20 most recent invoices ordered by `issuedAt DESC`, filtered by `userId`

**Rationale**: The spec defines "latest invoices" without a specific count. 20 is a common
page size that balances content density with performance. Pagination is out of scope per
the feature assumptions.
