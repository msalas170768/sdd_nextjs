# Implementation Plan: Invoice CRUD

**Branch**: `002-invoice-crud` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-invoice-crud/spec.md`

## Summary

Add full CRUD operations to the invoice dashboard: a shared `CrudInvoice` Client Component
renders both the create and edit forms (Shadcn/ui + React Hook Form + Zod validation), an
`InvoiceActionsCell` Client Component provides per-row View/Edit/Delete icons with SweetAlert2
confirmation for deletion, and three Next.js Server Actions (`createInvoice`, `updateInvoice`,
`deleteInvoice`) handle all mutations server-side. Delete is restricted to PENDING invoices.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 15 (App Router), Prisma 7, Auth.js v5, Tailwind CSS 4 (`@tailwindcss/postcss`),
Shadcn/ui (base-nova: `@base-ui/react` + Tailwind 4), React Hook Form v7, Zod v4, SweetAlert2, `@hookform/resolvers`  
**Storage**: PostgreSQL via Prisma ORM (no schema changes — existing `Invoice` model)  
**Testing**: TypeScript compiler as primary correctness gate; manual smoke test per quickstart.md  
**Target Platform**: Web — server-rendered with Client Component islands for form interactivity  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Form submit → redirect < 2s (SC-002); error display < 1s (SC-005)  
**Constraints**: All `/dashboard/*` routes require authentication; Prisma calls only in Server
Components or Server Actions; `"use client"` only on interactive form/cell components  
**Scale/Scope**: CRUD for the authenticated user's own invoices only (FR-015)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-Design | Post-Design |
|-----------|------|-----------|-------------|
| I. App Router First | New routes under `app/dashboard/create_invoice/` and `app/dashboard/update_invoice/[id]/`; `next/navigation` for redirects; no `pages/` usage | ✅ PASS | ✅ PASS |
| II. Server Components by Default | Page files are async Server Components; `CrudInvoice` and `InvoiceActionsCell` are `"use client"` only because they need `useForm`, `useTransition`, and event handlers; all Prisma calls in Server Actions only | ✅ PASS | ✅ PASS |
| III. Tailwind CSS for All Styling | Shadcn/ui uses Tailwind exclusively; SweetAlert2 bundled CSS is a documented exception (see Complexity Tracking); no CSS Modules introduced | ⚠️ EXCEPTION | ✅ PASS (justified) |
| IV. Strict TypeScript Everywhere | `InvoiceFormValues` from `z.infer<typeof invoiceSchema>`; `CrudInvoiceProps` and `InvoiceActionsCellProps` explicitly typed; no `any`; Server Action return types explicit | ✅ PASS | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/002-invoice-crud/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── forms.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
app/
└── dashboard/
    ├── invoices/
    │   ├── page.tsx                    # MODIFIED: add "Add Invoice" button + options column
    │   ├── loading.tsx                 # unchanged
    │   └── [id]/
    │       ├── page.tsx                # unchanged
    │       └── loading.tsx             # unchanged
    ├── create_invoice/
    │   └── page.tsx                    # NEW: Server Component; renders <CrudInvoice />
    └── update_invoice/
        └── [id]/
            └── page.tsx                # NEW: Server Component; fetches invoice; renders <CrudInvoice invoice={...} />

components/
└── invoices/
    ├── InvoiceTable.tsx                # MODIFIED: add options column rendering
    ├── InvoiceRow.tsx                  # MODIFIED: render <InvoiceActionsCell> in options column
    ├── InvoiceActionsCell.tsx          # NEW: "use client" — View/Edit/Delete icons + SweetAlert2
    ├── CrudInvoice.tsx                 # NEW: "use client" — Shadcn form; create/edit mode
    ├── InvoiceDetail.tsx               # unchanged
    ├── InvoiceListSkeleton.tsx         # unchanged
    └── InvoiceDetailSkeleton.tsx       # unchanged

lib/
├── actions/
│   └── invoices.ts                     # NEW: createInvoice, updateInvoice, deleteInvoice Server Actions
├── validations/
│   └── invoice.ts                      # NEW: invoiceSchema (Zod) + InvoiceFormValues type
├── db.ts                               # unchanged
└── auth.ts                             # unchanged
```

**Structure Decision**: Single Next.js App Router project. New routes follow the flat `dashboard/`
convention established in feature 001. Server Actions live in `lib/actions/` (server-only). Zod
schema in `lib/validations/` — shared between Server Actions (authoritative validation) and the
Client Component form (`zodResolver`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SweetAlert2 bundled CSS (Principle III exception) | Explicitly required in `prompts/plan2.md`; provides accessible, well-tested confirmation dialog with minimal setup | Shadcn `<AlertDialog>` is Tailwind-compliant but uses `@base-ui/react` Dialog primitive in the `base-nova` style — viable drop-in replacement if SweetAlert2 is later removed; `window.confirm()` is not accessible |
