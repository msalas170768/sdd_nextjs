# Implementation Plan: Invoice Dashboard

**Branch**: `001-invoice-dashboard` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-invoice-dashboard/spec.md`

## Summary

Build an authenticated invoice dashboard that displays a list of the current user's latest
invoices using Next.js App Router, with dynamic routing to per-invoice detail pages and
React Suspense skeleton loaders. Data is fetched server-side via Prisma (PostgreSQL), routes
are protected by Auth.js middleware, and all styling uses Tailwind CSS.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router), Prisma 7, Auth.js v5 (NextAuth), Tailwind CSS 3, `pg` + `@prisma/adapter-pg` (driver adapter)
**Storage**: PostgreSQL via Prisma ORM
**Testing**: Playwright for e2e (if requested); TypeScript compiler as primary correctness gate
**Target Platform**: Web — server-rendered, modern browsers
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Invoice list visible < 2s; navigation to detail < 1s; skeleton visible < 100ms
**Constraints**: All `/dashboard/*` routes require authentication; data fetching in Server
Components only; no client-side fetch for initial invoice data
**Scale/Scope**: Dashboard feature for authenticated users; 20 most recent invoices per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-Design | Post-Design |
|-----------|------|-----------|-------------|
| I. App Router First | All routes under `app/dashboard/invoices/`; no `pages/` directory; `next/navigation` used for routing | ✅ PASS | ✅ PASS |
| II. Server Components by Default | `page.tsx` files are async Server Components; Prisma called directly; no `"use client"` on data-fetching components | ✅ PASS | ✅ PASS |
| III. Tailwind CSS for All Styling | Skeleton loaders use `animate-pulse bg-gray-200`; all layout uses Tailwind utilities; no CSS Modules | ✅ PASS | ✅ PASS |
| IV. Strict TypeScript Everywhere | `InvoiceSummary`, `InvoiceDetail` interfaces defined; all component props typed; Prisma client is fully typed; no `any` | ✅ PASS | ✅ PASS |

All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-invoice-dashboard/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── data-access.md  # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
app/
├── dashboard/
│   └── invoices/
│       ├── page.tsx               # Invoice list (Server Component, async)
│       ├── loading.tsx            # Suspense skeleton for list
│       └── [id]/
│           ├── page.tsx           # Invoice detail (Server Component, async)
│           └── loading.tsx        # Suspense skeleton for detail
├── layout.tsx                     # Root layout with Auth.js SessionProvider
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts           # Auth.js API handler

components/
└── invoices/
    ├── InvoiceTable.tsx           # Table of invoices (Server Component)
    ├── InvoiceRow.tsx             # Single row with <Link> (Server Component)
    ├── InvoiceDetail.tsx          # Full detail view (Server Component)
    ├── InvoiceListSkeleton.tsx    # Skeleton for list loading state
    └── InvoiceDetailSkeleton.tsx  # Skeleton for detail loading state

lib/
├── auth.ts                        # Auth.js v5 config + Prisma adapter
├── db.ts                          # Prisma client singleton
└── invoices.ts                    # Typed data access functions

prisma/
└── schema.prisma                  # Invoice model + InvoiceStatus enum (no url — Prisma 7)

prisma.config.ts                   # Prisma 7 config: datasource.url for migrate commands
middleware.ts                      # Auth.js route protection for /dashboard/*
```

**Structure Decision**: Next.js App Router web application (single project). All data
fetching is co-located in Server Component pages and delegated to `lib/invoices.ts`. The
`app/` directory is the sole routing root; no `pages/` directory is created.

## Complexity Tracking

> No Constitution Check violations — table not required.
