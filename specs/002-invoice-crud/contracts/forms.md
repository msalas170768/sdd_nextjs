# Interface Contracts: Invoice CRUD Forms & Actions

**Feature**: Invoice CRUD | **Branch**: `002-invoice-crud` | **Date**: 2026-04-30

## Component Contracts

### `CrudInvoice` (Client Component)

**File**: `components/invoices/CrudInvoice.tsx`  
**Directive**: `"use client"` — uses `useForm`, `useTransition`, form submission handlers

```typescript
interface CrudInvoiceProps {
  invoice?: {
    id: string
    amount: number      // converted from Prisma Decimal before passing as prop
    currency: string
    status: 'PAID' | 'PENDING' | 'OVERDUE'
    dueDate: Date
    issuedAt: Date
    description: string | null
  }
}
```

- When `invoice` is `undefined`: component renders in **create mode** (empty form)
- When `invoice` is provided: component renders in **edit mode** (pre-populated fields)
- The component determines its mode from the presence of `invoice` prop — no explicit `mode` prop

**Internal behavior**:
- `useForm<InvoiceFormValues>` with `zodResolver(invoiceSchema)` for validation
- `useTransition` wraps the Server Action call; `isPending` disables the Aceptar button
- On success: Server Action calls `redirect('/dashboard/invoices')` internally
- On failure: Server Action returns `{ error: string }`; displayed in form alert

### `InvoiceActionsCell` (Client Component)

**File**: `components/invoices/InvoiceActionsCell.tsx`  
**Directive**: `"use client"` — uses `useState`, click handlers, SweetAlert2

```typescript
interface InvoiceActionsCellProps {
  invoiceId: string
  invoiceStatus: 'PAID' | 'PENDING' | 'OVERDUE'
}
```

**Internal behavior**:
- Renders three icon buttons: View, Edit, Delete
- View: `<Link href={/dashboard/invoices/${invoiceId}}>` (Server-side navigation)
- Edit: `<Link href={/dashboard/update_invoice/${invoiceId}}>` (Server-side navigation)
- Delete: only enabled when `invoiceStatus === 'PENDING'`; triggers SweetAlert2 confirmation
- On SweetAlert2 confirm: calls `deleteInvoice(invoiceId)` Server Action; redirects on success

## Server Action Contracts

**File**: `lib/actions/invoices.ts`  
**Runtime**: Server only — never imported by Edge Runtime code

### `createInvoice`

```typescript
async function createInvoice(
  data: InvoiceFormValues
): Promise<{ error: string } | never>
```

- Validates `data` with `invoiceSchema.parse(data)` (server-authoritative)
- Reads `userId` from `auth()` session — never from client input
- Calls `db.invoice.create({ data: { ...validated, userId } })`
- On success: calls `revalidatePath('/dashboard/invoices')` then `redirect('/dashboard/invoices')`
- On Prisma error: returns `{ error: errorMessage }` — does NOT throw

### `updateInvoice`

```typescript
async function updateInvoice(
  id: string,
  data: InvoiceFormValues
): Promise<{ error: string } | never>
```

- Validates `data` with `invoiceSchema.parse(data)`
- Verifies the invoice belongs to the current session user (FR-015 cross-user guard):
  `db.invoice.findFirst({ where: { id, userId } })` — returns 404 if not found
- Calls `db.invoice.update({ where: { id }, data: validated })`
- On success: `revalidatePath('/dashboard/invoices')` + `redirect('/dashboard/invoices')`
- On Prisma error: returns `{ error: errorMessage }`

### `deleteInvoice`

```typescript
async function deleteInvoice(
  id: string
): Promise<{ error: string } | never>
```

- Fetches invoice: `db.invoice.findFirst({ where: { id, userId } })`
- Guard: if `invoice.status !== 'PENDING'` → returns `{ error: 'Only PENDING invoices can be deleted' }`
- Calls `db.invoice.delete({ where: { id } })`
- On success: `revalidatePath('/dashboard/invoices')` + `redirect('/dashboard/invoices')`
- On Prisma error: returns `{ error: errorMessage }`

## Zod Schema Contract

**File**: `lib/validations/invoice.ts`

```typescript
import { z } from 'zod'

export const invoiceSchema = z.object({
  amount:      z.coerce.number().positive('Amount must be positive'),
  currency:    z.string().min(1).max(3),
  status:      z.enum(['PAID', 'PENDING', 'OVERDUE']),
  dueDate:     z.coerce.date(),
  issuedAt:    z.coerce.date(),
  description: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
```

## Route Contracts

| Route                              | Page Component          | Mode   | Auth |
|------------------------------------|-------------------------|--------|------|
| `/dashboard/create_invoice`        | `app/dashboard/create_invoice/page.tsx` | Create | Required |
| `/dashboard/update_invoice/[id]`   | `app/dashboard/update_invoice/[id]/page.tsx` | Edit | Required |

Both pages are **Server Components** that:
1. Verify auth via `auth()` — redirect to `/login` if unauthenticated
2. Fetch invoice data (edit page only) from `db.invoice.findFirst({ where: { id, userId } })`
3. Return 404 (`notFound()`) if invoice not found or belongs to another user
4. Render `<CrudInvoice invoice={...} />` as a Client Component subtree
