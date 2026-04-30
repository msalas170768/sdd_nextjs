# Data Model: Invoice CRUD

**Feature**: Invoice CRUD | **Branch**: `002-invoice-crud` | **Date**: 2026-04-30

## Entities

### Invoice (existing — no schema changes)

The `Invoice` entity already exists in `prisma/schema.prisma`. This feature adds no new fields
or relations. The CRUD operations operate on the following **editable fields**:

| Field         | Prisma Type        | Zod Schema                            | Notes                            |
|---------------|--------------------|---------------------------------------|----------------------------------|
| `amount`      | `Decimal @db.Decimal(10,2)` | `z.coerce.number().positive()` | HTML `<input type="number">` coerced to `number` |
| `currency`    | `String`           | `z.string().min(1).max(3)`            | e.g., "USD", "EUR"              |
| `status`      | `InvoiceStatus`    | `z.enum(['PAID','PENDING','OVERDUE'])` | Controls delete eligibility     |
| `dueDate`     | `DateTime`         | `z.coerce.date()`                     | HTML `<input type="date">` coerced to `Date` |
| `issuedAt`    | `DateTime`         | `z.coerce.date()`                     | HTML `<input type="date">` coerced to `Date` |
| `description` | `String?`          | `z.string().optional()`               | Nullable/optional               |

**System-managed fields** (not editable via form):

| Field       | Prisma Type        | Notes                                          |
|-------------|--------------------|------------------------------------------------|
| `id`        | `String @id @default(cuid())` | Auto-generated CUID                |
| `userId`    | `String`           | Set from authenticated session; never from input |
| `createdAt` | `DateTime @default(now())` | Auto-set on create                   |
| `updatedAt` | `DateTime @updatedAt`      | Auto-updated by Prisma               |

## Zod Schema

```typescript
// lib/validations/invoice.ts
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

**Zod version requirement**: Zod 3.22+ for stable `z.coerce.number()` and `z.coerce.date()`.

## State Transitions

```
       ┌──────────────────────────────────┐
       │                                  │
  PENDING ──────── editable, deletable    │
     │                                    │
     └──► PAID / OVERDUE ─── editable,    │
                              NOT deletable│
       └──────────────────────────────────┘
```

Delete eligibility: `status === 'PENDING'` — enforced both in the UI (icon disabled) and
in the Server Action (guard before Prisma delete call).

## Validation Rules

| Rule                        | Layer          | Implementation                                 |
|-----------------------------|----------------|------------------------------------------------|
| Amount must be positive     | Client + Server | Zod `z.coerce.number().positive()`            |
| Due date must be a valid date | Client + Server | Zod `z.coerce.date()`                        |
| Issue date must be a valid date | Client + Server | Zod `z.coerce.date()`                      |
| Status must be one of enum  | Client + Server | Zod `z.enum([...])`                            |
| userId must match session   | Server only    | Server Action reads from `auth()` session       |
| Delete only PENDING invoices | Server only   | Guard: `if (invoice.status !== 'PENDING') throw` |

**Server is the authoritative validation gate.** Client-side Zod validation is UX-only.
