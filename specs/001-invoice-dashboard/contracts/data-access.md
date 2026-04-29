# Contracts: Invoice Dashboard

**Feature**: Invoice Dashboard | **Branch**: `001-invoice-dashboard` | **Date**: 2026-04-29

## TypeScript Interfaces

### InvoiceSummary — used in list view

```typescript
// lib/invoices.ts

export interface InvoiceSummary {
  id: string;
  amount: string;          // Decimal serialized as string to avoid floating-point issues
  currency: string;        // ISO 4217 (e.g., "USD")
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;         // ISO 8601 date-time
  issuedAt: string;        // ISO 8601 date-time
  description: string | null;
}
```

### InvoiceDetail — used in detail view

```typescript
export interface InvoiceDetail extends InvoiceSummary {
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}
```

## Data Access Function Signatures

```typescript
// lib/invoices.ts

/**
 * Returns the 20 most recent invoices for the given user, ordered by issuedAt DESC.
 * Throws if userId is empty or the database call fails.
 */
export async function getInvoices(userId: string): Promise<InvoiceSummary[]>;

/**
 * Returns a single invoice by ID scoped to the authenticated user.
 * Returns null if the invoice does not exist or belongs to a different user.
 */
export async function getInvoiceById(
  invoiceId: string,
  userId: string,
): Promise<InvoiceDetail | null>;
```

## Component Prop Contracts

```typescript
// components/invoices/InvoiceTable.tsx
interface InvoiceTableProps {
  invoices: InvoiceSummary[];
}

// components/invoices/InvoiceRow.tsx
interface InvoiceRowProps {
  invoice: InvoiceSummary;
}

// components/invoices/InvoiceDetail.tsx
interface InvoiceDetailProps {
  invoice: InvoiceDetail;
}
```

## Route Contract

| Route                          | Page Component         | Required Data            |
|-------------------------------|------------------------|--------------------------|
| `/dashboard/invoices`          | `app/dashboard/invoices/page.tsx`      | `InvoiceSummary[]` for current user |
| `/dashboard/invoices/[id]`     | `app/dashboard/invoices/[id]/page.tsx` | `InvoiceDetail` for given `id` + current user |

## Middleware Contract

```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*'],
};

// Auth.js v5 — re-exported as middleware
export { auth as middleware } from '@/lib/auth';
```

Unauthenticated requests to any `/dashboard/*` path are redirected to `/login`.
Authenticated requests pass through with session available via `auth()` in Server Components.

## Auth Session Contract

```typescript
// Obtained inside any Server Component or data function via:
import { auth } from '@/lib/auth';

const session = await auth();
// session.user.id — the authenticated userId passed to all data access functions
// session is null for unauthenticated requests (middleware prevents reaching page)
```
