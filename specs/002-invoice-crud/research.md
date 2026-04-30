# Research: Invoice CRUD

**Feature**: Invoice CRUD | **Branch**: `002-invoice-crud` | **Date**: 2026-04-30

## Form UI Library

**Decision**: Shadcn/ui

**Rationale**: Shadcn/ui components are built on Radix UI primitives styled exclusively with
Tailwind CSS — fully compatible with Constitution Principle III (Tailwind only). Components
are copied into the project (`components/ui/`) rather than installed as an opaque package,
giving full control over styling. Shadcn's `<Form>`, `<Input>`, `<Select>`, and `<Button>`
components integrate natively with React Hook Form via `FormField`/`FormControl` wrappers.

**Alternatives considered**:
- Raw HTML inputs + Tailwind — functional but duplicates what Shadcn already provides.
- Radix UI directly without Shadcn — more configuration; Shadcn adds the Tailwind layer.

**Setup**: `npx shadcn@latest init` followed by `npx shadcn@latest add form input select
button alert-dialog label textarea`.

---

## Form State & Validation

**Decision**: React Hook Form v7 + Zod v3 via `@hookform/resolvers`

**Rationale**: `useForm` from React Hook Form manages controlled form state with minimal
re-renders, required for the Client Component `CrudInvoice`. Zod provides runtime validation
AND generates TypeScript types (`z.infer<typeof schema>`), satisfying Constitution Principle IV.

**Zod version for complex numeric and date validations**:

- **Numeric (amount)**: `z.coerce.number().positive()` — coerces the HTML string input to a
  number before validation. Available since Zod v3.20.
- **Date (dueDate, issuedAt)**: `z.coerce.date()` — parses `YYYY-MM-DD` strings from HTML
  `<input type="date">` into `Date` objects. Available since Zod v3.20.
- **Enum (status)**: `z.enum(['PAID', 'PENDING', 'OVERDUE'])` — generates union type.
- **Minimum recommended version**: **Zod 3.22+** for stable `z.coerce.*` and `.pipe()`
  chaining. Current latest stable (3.24.x) recommended.

**Alternatives considered**:
- Yup — less TypeScript-native; `z.infer` is more ergonomic.
- Valibot — smaller bundle but less ecosystem adoption for this use case.

---

## Alert and Confirmation Dialog

**Decision**: SweetAlert2

**Rationale**: Explicitly requested in `prompts/plan2.md`. SweetAlert2 provides a
well-tested, accessible confirmation dialog for the delete flow with minimal setup.
It is a Client-side browser library compatible with Next.js Client Components.

**Constitution Principle III compatibility note**: SweetAlert2 injects its own bundled CSS
(not CSS-in-JS, not CSS Modules). Its styles are scoped to its dialog overlay and do not
interfere with Tailwind. This is documented as a justified exception in Complexity Tracking
— the alternative (Shadcn `<AlertDialog>`) is Tailwind-compliant and viable if the team
prefers full Tailwind consistency.

**Installation**: `npm install sweetalert2`

**Alternatives considered**:
- Shadcn `<AlertDialog>` — Tailwind-native, no external CSS; recommended if SweetAlert2 is
  later removed. Can serve as a drop-in replacement.
- Browser `window.confirm()` — not accessible or customizable; not viable for production UI.

---

## Server Actions for Mutations

**Decision**: Next.js Server Actions in `lib/actions/invoices.ts`

**Rationale**: Server Actions run exclusively on the server — Prisma calls never reach the
client bundle. They can be called directly from Client Components (like `CrudInvoice`)
without a REST API layer. After mutation, `revalidatePath('/dashboard/invoices')` invalidates
the Server Component cache so the list reflects the latest data. Redirecting after success
uses `redirect('/dashboard/invoices')` inside the action.

**Alternatives considered**:
- Route Handlers (`/api/invoices`) — REST endpoint adds an unnecessary HTTP round-trip.
- Direct Prisma calls in Client Component — impossible (Prisma runs server-side only).

---

## Optimistic Update / Pending State

**Decision**: `useTransition` (React built-in) + form `isPending` state

**Rationale**: `useTransition` wraps the Server Action call and provides an `isPending`
boolean. While the action is in flight, the Aceptar button is disabled (prevents duplicate
submissions — FR-006 / SC-006). No additional library needed.

---

## Data Revalidation After Mutation

**Decision**: `revalidatePath('/dashboard/invoices')` inside each Server Action

**Rationale**: Calling `revalidatePath` in a Server Action invalidates the Next.js full-route
cache for the invoice list. The next navigation to `/dashboard/invoices` fetches fresh data
from Prisma. Combined with `redirect('/dashboard/invoices')` after success, the list is
always current (SC-002).
