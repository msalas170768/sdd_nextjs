# Data Model: Invoice Dashboard

**Feature**: Invoice Dashboard | **Branch**: `001-invoice-dashboard` | **Date**: 2026-04-29

## Entities

### Invoice

Represents a financial invoice associated with a single authenticated user.

| Field       | Type          | Constraints                      | Notes                                    |
|-------------|---------------|----------------------------------|------------------------------------------|
| id          | String        | PK, `cuid()`                     | Unique identifier used in dynamic routes |
| amount      | Decimal(10,2) | NOT NULL, > 0                    | Monetary value (e.g., 125.00)            |
| currency    | String        | NOT NULL, default `"USD"`        | ISO 4217 currency code                   |
| status      | InvoiceStatus | NOT NULL                         | Enum: PAID, PENDING, OVERDUE             |
| dueDate     | DateTime      | NOT NULL                         | Payment deadline                         |
| issuedAt    | DateTime      | NOT NULL                         | When the invoice was issued              |
| description | String?       | optional                         | Brief summary of the invoice             |
| userId      | String        | NOT NULL, FK scoping             | Auth.js session `user.id`                |
| createdAt   | DateTime      | NOT NULL, `now()`                | Record creation timestamp                |
| updatedAt   | DateTime      | NOT NULL, auto-updated           | Last modification timestamp              |

**Index**: Composite `(userId, createdAt DESC)` — supports the primary query pattern
(fetch latest N invoices for a user).

### InvoiceStatus (Enum)

| Value     | Meaning                                          |
|-----------|--------------------------------------------------|
| `PAID`    | Payment received in full                         |
| `PENDING` | Awaiting payment; not yet past due date          |
| `OVERDUE` | Past due date; payment not received              |

### User (assumed/external)

Managed by Auth.js. The Invoice `userId` references the Auth.js session user identifier.
No additional User model fields are required by this feature; the auth provider owns the
User record.

| Field | Type   | Notes                                |
|-------|--------|--------------------------------------|
| id    | String | PK — matches Auth.js `session.user.id` |
| email | String | Unique                               |
| name  | String? | Display name                        |

## Prisma Schema Fragment

```prisma
// prisma/schema.prisma
// Prisma 7: URL is NOT in schema — configured in prisma.config.ts

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum InvoiceStatus {
  PAID
  PENDING
  OVERDUE
}

model Invoice {
  id          String        @id @default(cuid())
  amount      Decimal       @db.Decimal(10, 2)
  currency    String        @default("USD")
  status      InvoiceStatus
  dueDate     DateTime
  issuedAt    DateTime
  description String?
  userId      String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
}
```

## Validation Rules

- `amount` MUST be greater than `0.00`.
- `currency` MUST be a valid ISO 4217 three-letter code.
- `dueDate` is not constrained to future dates (historical invoices are valid records).
- `userId` MUST match the authenticated session user in all data access functions —
  enforced in `lib/invoices.ts`, not at the database level.
- Invoice records are read-only from the dashboard; this feature performs no writes.

## State Transitions

```
PENDING ──► PAID      (payment confirmed — external process)
PENDING ──► OVERDUE   (dueDate passes — scheduled job or computed on read)
OVERDUE ──► PAID      (late payment confirmed — external process)
```

Status transitions are not triggered by this dashboard feature; the dashboard displays
the current status as stored.
