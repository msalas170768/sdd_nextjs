# Tasks: Invoice CRUD

**Input**: Design documents from `/specs/002-invoice-crud/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/forms.md, research.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1]–[US4])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install libraries required by this feature before any component work begins

- [X] T001 Run `npx shadcn@latest init` and `npx shadcn@latest add form input select button label textarea` — copies Shadcn components into `components/ui/`
- [X] T002 [P] Run `npm install sweetalert2` — SweetAlert2 for deletion confirmation dialog
- [X] T003 [P] Run `npm install @hookform/resolvers` — Zod resolver bridge for React Hook Form
- [X] T004 [P] Verify `zod@4.x` is installed (`npm ls zod`); run `npm install zod@latest` if below v4

**Checkpoint**: All libraries installed — `npm ls react-hook-form zod sweetalert2 @hookform/resolvers` shows correct versions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Zod schema and Server Actions file that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create `lib/validations/invoice.ts` — `invoiceSchema` (Zod object with `z.coerce.number().positive()` for amount, `z.coerce.date()` for dueDate/issuedAt, `z.enum` for status) and `InvoiceFormValues` type via `z.infer`
- [X] T006 Create `lib/actions/invoices.ts` — file with `'use server'` directive and stub exports for `createInvoice`, `updateInvoice`, and `deleteInvoice` (each returns `{ error: 'not implemented' }` initially); stubs satisfy TypeScript import resolution for all story phases

**Checkpoint**: Foundation ready — `lib/validations/invoice.ts` and `lib/actions/invoices.ts` exist with correct exports; TypeScript compiles without errors

---

## Phase 3: User Story 1 — Create a New Invoice (Priority: P1) 🎯 MVP

**Goal**: User can click "Add Invoice", fill the form, submit, and see the new invoice in the refreshed list. Cancelar returns to the list with no changes.

**Independent Test**: Navigate to `/dashboard/invoices` → click "Add Invoice" → fill all fields → click Aceptar → redirected to list showing new invoice. Fill partial form → submit → validation errors shown inline, no redirect.

### Implementation for User Story 1

- [X] T007 [US1] Implement `createInvoice` in `lib/actions/invoices.ts` — parse `InvoiceFormValues` with `invoiceSchema.parse()`, read `userId` from `auth()` session, call `db.invoice.create(...)`, then `revalidatePath('/dashboard/invoices')` and `redirect('/dashboard/invoices')`; on Prisma error return `{ error: message }`
- [X] T008 [US1] Create `components/invoices/CrudInvoice.tsx` — `"use client"` component accepting `invoice?: CrudInvoiceProps['invoice']`; `useForm<InvoiceFormValues>` with `zodResolver(invoiceSchema)`; `useTransition` wraps Server Action call; Shadcn `<Form>`, `<Input>`, `<Select>`, `<Textarea>` fields for all six editable Invoice fields; Aceptar button disabled during `isPending`; Cancelar button links to `/dashboard/invoices`; display `{ error }` from Server Action in a Shadcn `<Alert>` below the form
- [X] T009 [US1] Create `app/dashboard/create_invoice/page.tsx` — async Server Component; call `auth()` and redirect to `/login` if unauthenticated; render `<CrudInvoice />` with no `invoice` prop (create mode)
- [X] T010 [US1] Add "Add Invoice" `<Link>` button to `app/dashboard/invoices/page.tsx` — positioned above the invoice table, navigates to `/dashboard/create_invoice`; styled with Tailwind as a primary button

**Checkpoint**: User Story 1 fully functional — create flow works end-to-end; validation errors surface inline; duplicate Aceptar clicks are blocked by disabled state

---

## Phase 4: User Story 4 — Options Column with View, Edit, Delete Icons (Priority: P1)

**Goal**: Every invoice row displays three icon buttons (View, Edit, Delete). View and Edit navigate correctly. Delete icon is visually disabled for non-PENDING invoices.

**Independent Test**: View the invoice list → every row has three icons in an options column. Click View → navigates to `/dashboard/invoices/[id]`. Click Edit → navigates to `/dashboard/update_invoice/[id]`. Delete icon on a PAID or OVERDUE invoice appears disabled and has no click effect.

### Implementation for User Story 4

- [X] T011 [US4] Create `components/invoices/InvoiceActionsCell.tsx` — `"use client"` component accepting `{ invoiceId: string; invoiceStatus: 'PAID' | 'PENDING' | 'OVERDUE' }`; renders three icon buttons using Shadcn `<Button variant="ghost" size="icon">`; View icon wraps `<Link href={/dashboard/invoices/${invoiceId}}>`, Edit icon wraps `<Link href={/dashboard/update_invoice/${invoiceId}}>`, Delete icon is `disabled` when `invoiceStatus !== 'PENDING'` (placeholder `onClick` with no-op for now — wired in US3)
- [X] T012 [P] [US4] Modify `components/invoices/InvoiceRow.tsx` (or equivalent list row component) to import and render `<InvoiceActionsCell invoiceId={invoice.id} invoiceStatus={invoice.status} />` in a new table cell at the end of each row
- [X] T013 [P] [US4] Modify `components/invoices/InvoiceTable.tsx` (or equivalent) to add an "Options" header column aligned with the new cell added in T012
- [X] T014 [US4] Verify the `invoiceStatus` field is included in the Prisma select query in `lib/data/invoices.ts` (or wherever list data is fetched) — add `status` to the select if missing so `InvoiceActionsCell` receives it

**Checkpoint**: Options column visible on all rows; View and Edit icons navigate correctly; Delete icon visually disabled on PAID/OVERDUE invoices; TypeScript compiles with no `any`

---

## Phase 5: User Story 2 — Edit an Existing Invoice (Priority: P2)

**Goal**: User clicks the Edit icon, lands on the edit page with all fields pre-populated, modifies values, clicks Aceptar, and sees updated invoice in the refreshed list. Cancelar returns to list unchanged.

**Independent Test**: Click Edit on any row → URL changes to `/dashboard/update_invoice/[id]` → all six editable fields show current invoice values → change amount → Aceptar → list shows updated amount. Navigate directly to `/dashboard/update_invoice/[id]` without auth → redirected to `/login`. Navigate to a valid-format ID that does not belong to the user → `notFound()` rendered.

### Implementation for User Story 2

- [X] T015 [US2] Implement `updateInvoice(id: string, data: InvoiceFormValues)` in `lib/actions/invoices.ts` — parse with `invoiceSchema.parse()`, verify invoice belongs to session user via `db.invoice.findFirst({ where: { id, userId } })` (return `{ error }` if not found), call `db.invoice.update(...)`, then `revalidatePath` + `redirect`; on Prisma error return `{ error: message }`
- [X] T016 [US2] Create `app/dashboard/update_invoice/[id]/page.tsx` — async Server Component; call `auth()` and redirect to `/login` if unauthenticated; fetch invoice with `db.invoice.findFirst({ where: { id: params.id, userId: session.user.id } })`; call `notFound()` if not found; convert `invoice.amount` from Prisma `Decimal` to `number` before passing; render `<CrudInvoice invoice={...} />` (edit mode — component pre-populates fields from prop via `defaultValues`)
- [X] T017 [US2] Extend `CrudInvoice.tsx` to handle edit mode — when `invoice` prop is present, pass `defaultValues` to `useForm` from the invoice prop; bind `updateInvoice(invoice.id, data)` as the submit handler in edit mode and `createInvoice(data)` in create mode; no additional UI changes required

**Checkpoint**: User Story 2 fully functional — edit flow works end-to-end; form pre-populates correctly; ownership guard prevents cross-user access; TypeScript strict mode passes

---

## Phase 6: User Story 3 — Delete a PENDING Invoice (Priority: P3)

**Goal**: Clicking Delete on a PENDING invoice shows a SweetAlert2 confirmation. Confirming deletes the invoice and refreshes the list. Canceling dismisses with no change. Delete icon for non-PENDING invoices remains disabled.

**Independent Test**: Click Delete on a PENDING invoice → SweetAlert2 modal appears → confirm → invoice gone from list. Click Delete on a PENDING invoice → cancel → invoice still in list. Delete icon on PAID or OVERDUE invoice: disabled (no dialog triggered).

### Implementation for User Story 3

- [X] T018 [US3] Implement `deleteInvoice(id: string)` in `lib/actions/invoices.ts` — fetch invoice with `db.invoice.findFirst({ where: { id, userId } })`, guard that `status === 'PENDING'` (return `{ error }` otherwise), call `db.invoice.delete({ where: { id } })`, then `revalidatePath` + `redirect`; on Prisma error return `{ error: message }`
- [X] T019 [US3] Wire the Delete button in `InvoiceActionsCell.tsx` — import SweetAlert2 (`import Swal from 'sweetalert2'`); on click (only when `invoiceStatus === 'PENDING'`) show `Swal.fire({ title: '¿Eliminar factura?', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' })`; on `result.isConfirmed` call `deleteInvoice(invoiceId)` inside `startTransition`; display any returned `{ error }` via a second `Swal.fire` error alert
- [X] T020 [P] [US3] Import SweetAlert2 CSS in the root client layout or in `InvoiceActionsCell.tsx` — `import 'sweetalert2/dist/sweetalert2.min.css'` (required for SweetAlert2 styles to appear; documented Tailwind exception per plan.md Complexity Tracking)
- [X] T021 [US3] Verify Delete icon `disabled` attribute and `aria-disabled` are correctly set in `InvoiceActionsCell.tsx` for non-PENDING invoices — confirm clicking the disabled button has no effect and no dialog opens

**Checkpoint**: User Story 3 fully functional — SweetAlert2 confirmation works; only PENDING invoices can be deleted; disabled state enforced both UI and server-side

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all user stories

- [X] T022 Run quickstart.md smoke test checklist end-to-end — verify all 7 manual steps pass (Add Invoice, create, Edit, update, Delete PENDING, Delete PAID disabled)
- [X] T023 [P] TypeScript compilation check — run `npx tsc --noEmit`; resolve any remaining strict-mode errors (no `any`, all props typed, Server Action return types explicit)
- [X] T024 [P] Confirm `InvoiceActionsCell` and `CrudInvoice` are the only files with `"use client"` directive in this feature — all page files (`create_invoice/page.tsx`, `update_invoice/[id]/page.tsx`) must be Server Components

**Checkpoint**: All four user stories tested independently; TypeScript clean; constitution compliant

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002/T003/T004 are parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — blocks all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start immediately after Foundational
- **US4 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 after Phase 2
- **US2 (Phase 5)**: Depends on Phase 3 (CrudInvoice component) — must follow US1
- **US3 (Phase 6)**: Depends on Phase 4 (InvoiceActionsCell) — must follow US4
- **Polish (Phase 7)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete → independent
- **US4 (P1)**: Foundational complete → independent (parallel with US1)
- **US2 (P2)**: US1 complete (needs CrudInvoice) + Foundational
- **US3 (P3)**: US4 complete (needs InvoiceActionsCell) + Foundational

### Parallel Opportunities

- T002, T003, T004 — all library installs (different packages, no dependencies)
- T012, T013 — InvoiceRow and InvoiceTable modifications (different files)
- T020 — CSS import (separate from delete logic in T019)
- T023, T024 — TypeScript check and `"use client"` audit (independent reads)

---

## Parallel Example: Phase 1 (Setup)

```
# All library installs in parallel:
Task T001: npx shadcn@latest init + add components
Task T002: npm install sweetalert2
Task T003: npm install @hookform/resolvers
Task T004: npm ls zod (verify version)
```

## Parallel Example: After Phase 2 (Foundational Complete)

```
# US1 and US4 can run in parallel:
Developer A → Phase 3 (US1): T007 → T008 → T009 → T010
Developer B → Phase 4 (US4): T011 → T012+T013 → T014
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Create Invoice)
4. **STOP and VALIDATE**: Create an invoice end-to-end; check validation, redirect, list refresh
5. Continue to Phase 4 (Options Column) when MVP is confirmed

### Incremental Delivery

1. Phase 1 + Phase 2 → shared infrastructure ready
2. Phase 3 (US1) → "Add Invoice" works → MVP delivered
3. Phase 4 (US4) → all three icons visible on every row
4. Phase 5 (US2) → Edit flow works
5. Phase 6 (US3) → Delete flow with confirmation
6. Phase 7 → Polish and final validation

---

## Notes

- [P] tasks = different files, no inter-task dependencies — safe to run concurrently
- `CrudInvoice` mode (create vs edit) is determined by presence of `invoice` prop — no explicit mode prop needed (per spec Assumptions)
- `Decimal` → `number` conversion must happen in the Server Component page before passing as prop (Prisma `Decimal` is not JSON-serializable)
- SweetAlert2 CSS import is required — without it the dialog renders unstyled
- Server Actions must import `auth` from `@/lib/auth` (NOT from `@/auth.config`) — the full config with Prisma adapter is required for session access
- Delete guard must be enforced **both** in the UI (`disabled` button) and in the Server Action (ownership + status check) to satisfy FR-015 and SC-004
