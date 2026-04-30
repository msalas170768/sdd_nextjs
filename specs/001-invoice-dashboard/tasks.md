---
description: "Task list for Invoice Dashboard feature implementation"
---

# Tasks: Invoice Dashboard

**Input**: Design documents from `/specs/001-invoice-dashboard/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Tests**: No tests requested in the feature specification — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration of the full technology stack.

- [X] T001 Initialize Next.js 15 project with App Router and set `"strict": true` in `tsconfig.json`
- [X] T002 [P] Configure Tailwind CSS in `tailwind.config.ts` and set up `app/globals.css` with Tailwind directives
- [X] T003 [P] Install Prisma 7 (`prisma@^7.3`, `@prisma/client@^7.3`, `@prisma/adapter-pg@^7.3`, `pg@^8.13`, `@types/pg`), initialize `prisma/schema.prisma` **without** `url` in the datasource block, create `prisma.config.ts` with `defineConfig({ datasource: { url: process.env.DATABASE_URL } })` for migrate/push commands, and configure `DATABASE_URL` in `.env.local`
- [X] T004 [P] Install Auth.js v5 (`next-auth@beta`) and add `AUTH_SECRET` and `AUTH_URL` to `.env.local`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define `InvoiceSummary` and `InvoiceDetail` TypeScript interfaces in `lib/invoices.ts` per `contracts/data-access.md`
- [X] T006 [P] Add `InvoiceStatus` enum (PAID, PENDING, OVERDUE) and `Invoice` model with composite index `(userId, createdAt DESC)` to `prisma/schema.prisma` — datasource block uses only `provider = "postgresql"` (no `url`; Prisma 7 reads the URL from `prisma.config.ts`)
- [X] T007 Create Prisma client singleton in `lib/db.ts` — creates a `Pool` from `DATABASE_URL`, wraps it in `PrismaPg` adapter, passes the adapter to `new PrismaClient({ adapter })`, and re-uses the instance across hot reloads via `globalThis`
- [X] T008 Configure Auth.js v5 in `lib/auth.ts` with Prisma adapter pointing to `lib/db.ts` for session storage
- [X] T009 Create Auth.js catch-all API route in `app/api/auth/[...nextauth]/route.ts` exporting GET and POST handlers from Auth.js
- [X] T010 [P] Create login page in `app/login/page.tsx` with a sign-in button that calls Auth.js `signIn()` (Client Component — requires `"use client"`)
- [X] T011 Implement `middleware.ts` at the repository root that re-exports `auth` from `lib/auth.ts` as `middleware` with matcher `['/dashboard/:path*']`
- [ ] T012 Run `npx prisma db push` to apply the Invoice schema to the PostgreSQL database (requires T006, T007)

**Checkpoint**: Foundation ready — all user story phases can begin.

---

## Phase 3: User Story 1 — View Invoice List (Priority: P1) 🎯 MVP

**Goal**: Authenticated user sees a table of their 20 most recent invoices at `/dashboard/invoices`.

**Independent Test**: Navigate to `/dashboard/invoices` while logged in — a table renders with
invoice ID, amount, currency, status, and issue date per row. An empty-state message appears
when no invoices exist. Unauthenticated access redirects to `/login`.

### Implementation for User Story 1

- [X] T013 [US1] Implement `getInvoices(userId: string): Promise<InvoiceSummary[]>` in `lib/invoices.ts` — query Prisma for the 20 most recent invoices by `issuedAt DESC` scoped to `userId`, serialize `Decimal` amount to string
- [X] T014 [P] [US1] Create `InvoiceRow` component in `components/invoices/InvoiceRow.tsx` — typed `InvoiceRowProps`, renders one `<tr>` with `<Link href={/dashboard/invoices/${invoice.id}}>` wrapping a clickable row
- [X] T015 [P] [US1] Create `InvoiceTable` component in `components/invoices/InvoiceTable.tsx` — typed `InvoiceTableProps`, renders a `<table>` with header columns (ID, Amount, Status, Due Date, Issued) and maps invoices to `InvoiceRow`
- [X] T016 [US1] Create `app/dashboard/invoices/page.tsx` as an `async` Server Component — call `auth()` for session, call `getInvoices(session.user.id)`, render `InvoiceTable` if invoices exist or an empty-state `<p>` if the array is empty

**Checkpoint**: User Story 1 is fully functional and independently testable. This is the MVP.

---

## Phase 4: User Story 2 — Navigate to Invoice Detail (Priority: P2)

**Goal**: Clicking any invoice row navigates to `/dashboard/invoices/[id]` and renders that invoice's full details. Direct URL access also works; non-owned or missing invoices return not-found.

**Independent Test**: Click any row on the invoice list — `/dashboard/invoices/<id>` renders
with all fields (amount, currency, status, due date, issued date, description, timestamps).
Entering a random or unowned ID returns the Next.js 404 page.

### Implementation for User Story 2

- [X] T017 [US2] Implement `getInvoiceById(invoiceId: string, userId: string): Promise<InvoiceDetail | null>` in `lib/invoices.ts` — query Prisma by `id` AND `userId`, return `null` if not found or ownership mismatch, serialize Decimal and Date fields
- [X] T018 [P] [US2] Create `InvoiceDetail` component in `components/invoices/InvoiceDetail.tsx` — typed `InvoiceDetailProps`, renders all `InvoiceDetail` fields in a structured layout using Tailwind utility classes
- [X] T019 [US2] Create `app/dashboard/invoices/[id]/page.tsx` as an `async` Server Component — call `auth()` for session, call `getInvoiceById(params.id, session.user.id)`, call `notFound()` if result is `null`, render `InvoiceDetail` with the returned data

**Checkpoint**: User Stories 1 and 2 are independently functional. Rows link to working detail pages.

---

## Phase 5: User Story 3 — Skeleton Loading States (Priority: P3)

**Goal**: Animated Tailwind skeleton loaders appear immediately on route transitions for both
the invoice list and detail pages, replaced by content once data loads.

**Independent Test**: Open DevTools → Network → throttle to Slow 4G → navigate to
`/dashboard/invoices` — an animated skeleton matching the table layout appears before data.
Same test on `/dashboard/invoices/[id]` shows a detail skeleton.

### Implementation for User Story 3

- [X] T020 [P] [US3] Create `InvoiceListSkeleton` component in `components/invoices/InvoiceListSkeleton.tsx` — renders a table-shaped skeleton using Tailwind `animate-pulse` and `bg-gray-200 rounded` classes; include 5 placeholder rows matching the `InvoiceTable` column count
- [X] T021 [P] [US3] Create `InvoiceDetailSkeleton` component in `components/invoices/InvoiceDetailSkeleton.tsx` — renders a detail-shaped skeleton using Tailwind `animate-pulse` and `bg-gray-200 rounded` classes matching the `InvoiceDetail` field layout
- [X] T022 [US3] Create `app/dashboard/invoices/loading.tsx` that default-exports `InvoiceListSkeleton` — this file is App Router's automatic Suspense fallback for the list page
- [X] T023 [US3] Create `app/dashboard/invoices/[id]/loading.tsx` that default-exports `InvoiceDetailSkeleton` — this file is App Router's automatic Suspense fallback for the detail page

**Checkpoint**: All three user stories are independently functional. Skeleton loaders appear on
both routes during data fetching.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error boundaries, final validation, and constitution compliance verification.

- [X] T024 [P] Create `app/dashboard/invoices/error.tsx` — Client Component (`"use client"`) error boundary displaying a user-friendly message when the invoice list page throws (e.g., database unreachable)
- [X] T025 [P] Create `app/dashboard/invoices/[id]/error.tsx` — Client Component (`"use client"`) error boundary for the invoice detail page
- [X] T026 Verify TypeScript compilation: run `npx tsc --noEmit` and confirm zero errors under strict mode
- [ ] T027 [P] Run the quickstart.md validation checklist end-to-end against the running development server
- [X] T028 [P] Confirm constitution compliance: no `pages/` directory, no `.module.css` files, no `any` types, no `next/router` imports, no inline `style` props in any source file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — all four tasks can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
  - T007 requires T003 (Prisma installed)
  - T008 requires T007 (Prisma client available)
  - T009 requires T008 (auth config ready)
  - T010 requires T008 (auth config for signIn())
  - T011 requires T008 (auth export for middleware)
  - T012 requires T006 + T007 (schema and client both ready)
- **User Stories (Phase 3–5)**: All depend on Phase 2 completion
  - T013 requires T005 + T007 + T012
  - T016 requires T008 + T013 + T014 + T015
  - T017 requires T005 + T007 + T012
  - T019 requires T017 + T018
  - T022 requires T020
  - T023 requires T021
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Starts after Phase 2 — no dependency on US1 (foundational layer shared)
- **US3 (P3)**: Starts after Phase 2 — skeleton components are independent of US1/US2 logic

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- T006 (schema) and T005 (interfaces) can start immediately after Phase 1, in parallel
- T014 and T015 (InvoiceRow, InvoiceTable) can be built in parallel
- T017 and T018 (getInvoiceById, InvoiceDetail component) can be built in parallel
- T020 and T021 (skeleton components) can be built in parallel
- T024, T025, T027, T028 in Polish phase can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch in parallel (different files, no cross-dependencies):
Task: "Create InvoiceRow component in components/invoices/InvoiceRow.tsx"   # T014
Task: "Create InvoiceTable component in components/invoices/InvoiceTable.tsx"  # T015

# Then sequentially (depends on T014, T015, and T013):
Task: "Create app/dashboard/invoices/page.tsx async Server Component"  # T016
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Visit `/dashboard/invoices` — invoice table renders, empty state works, unauthenticated access redirects
5. Deploy/demo as MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 (T013–T016) → Validate independently → MVP!
3. User Story 2 (T017–T019) → Validate independently → Rows link to detail pages
4. User Story 3 (T020–T023) → Validate independently → Skeleton loaders active
5. Polish (T024–T028) → Error boundaries + final compliance check

---

## Notes

- [P] tasks operate on different files and have no incomplete dependencies — safe to parallelize
- [US*] label maps each task to its user story for traceability against spec.md
- Tests are not included (not requested in spec); `npx tsc --noEmit` is the primary correctness gate
- `InvoiceRow` uses `<Link>` (Server Component compatible) — no `"use client"` needed
- `loading.tsx` files use the App Router Suspense convention — no manual `<Suspense>` wrappers needed
- `error.tsx` files MUST be Client Components (`"use client"`) per Next.js App Router requirements
- All `Decimal` fields from Prisma MUST be serialized to `string` before passing to components
