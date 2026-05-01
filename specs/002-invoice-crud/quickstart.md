# Quickstart: Invoice CRUD

**Feature**: Invoice CRUD | **Branch**: `002-invoice-crud` | **Date**: 2026-04-30

## Prerequisites

- Feature 001 (invoice-dashboard) merged — Auth.js, Prisma, base layout all in place
- `npm install` up to date
- `.env.local` with `DATABASE_URL`, `AUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`

## Step 1 — Install Shadcn/ui

Run from the project root (requires Tailwind CSS 4 + `@tailwindcss/postcss` and `components/ui/` convention):

```bash
npx shadcn@latest init
```

When prompted, accept the defaults (TypeScript, Tailwind CSS, `src/` off, App Router on,
`components/ui/` as the component path, no Tailwind CSS variables if desired).

Then add the specific components used by `CrudInvoice`:

```bash
npx shadcn@latest add form input select button alert-dialog label textarea
```

This copies component source files into `components/ui/` — they are part of the codebase
and can be modified freely.

## Step 2 — Install React Hook Form Resolver

```bash
npm install @hookform/resolvers
```

React Hook Form itself is installed as a dependency by Shadcn's `form` component. Verify
versions after install:

```bash
npm ls react-hook-form zod
```

Expected: `react-hook-form@7.x`, `zod@4.x`.

## Step 3 — Install SweetAlert2

```bash
npm install sweetalert2
```

SweetAlert2 injects its own bundled CSS. This is a documented exception in the
Complexity Tracking table of `plan.md` — it does not conflict with Tailwind's utility
classes because it is scoped to its overlay.

## Step 4 — Verify Zod Version

The project uses Zod v4. Check the installed version:

```bash
npm ls zod
```

Expected: `zod@4.x`. If below v4, run `npm install zod@latest`.

## Step 5 — Validation Checklist

Before running the dev server, confirm these files exist:

- [ ] `lib/validations/invoice.ts` — Zod schema + `InvoiceFormValues` type
- [ ] `lib/actions/invoices.ts` — `createInvoice`, `updateInvoice`, `deleteInvoice`
- [ ] `components/invoices/CrudInvoice.tsx` — `"use client"`, `useForm`, `useTransition`
- [ ] `components/invoices/InvoiceActionsCell.tsx` — `"use client"`, SweetAlert2
- [ ] `app/dashboard/create_invoice/page.tsx` — Server Component, renders `<CrudInvoice />`
- [ ] `app/dashboard/update_invoice/[id]/page.tsx` — Server Component, pre-fetches invoice

## Step 6 — Manual Smoke Test

1. Navigate to `/dashboard/invoices`
2. Click "Add Invoice" → should land on `/dashboard/create_invoice`
3. Fill all fields → click Aceptar → invoice appears in list
4. Click Edit icon on any row → lands on `/dashboard/update_invoice/[id]` with pre-filled fields
5. Change a field → Aceptar → list shows updated values
6. Click Delete on a PENDING invoice → SweetAlert2 dialog appears → confirm → invoice removed
7. Click Delete on a PAID or OVERDUE invoice → icon should be visually disabled, no dialog

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `z.coerce.date()` produces `Invalid Date` | Zod < 3.20 | `npm install zod@latest` |
| SweetAlert2 dialog has no styles | CSS not imported | Import `sweetalert2/dist/sweetalert2.min.css` in a Client Component or layout |
| Shadcn component not found | `npx shadcn add ...` not run | Re-run `npx shadcn@latest add <component>` |
| Server Action 401 error | Session not available server-side | Verify `auth()` import from `@/lib/auth` (not auth.config) |
| Form not pre-populated on edit | `Decimal` not serialized | Convert `amount` from Prisma `Decimal` to `number` before passing as prop |
