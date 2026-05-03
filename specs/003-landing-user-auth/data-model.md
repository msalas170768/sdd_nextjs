# Data Model: Landing Page & User Authentication

**Branch**: `003-landing-user-auth` | **Date**: 2026-05-01

## Schema Changes

### User model — add `password` field

**File**: `prisma/schema.prisma`

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // NEW — bcrypt hash; null for OAuth-only accounts
  accounts      Account[]
  sessions      Session[]
  invoices      Invoice[]
}
```

**Migration**: Non-breaking. Existing rows get `password: null`. No data backfill.

**Constraint**: Email/password accounts MUST have `password != null`. Social-only accounts have
`password == null`. The `authorize` callback in `lib/auth.ts` returns `null` if the user record
has no password (prevents social accounts from logging in via Credentials).

---

## TypeScript Type Changes

### `InvoiceSummary` — add `userName`

**File**: `lib/invoices.ts`

```ts
export interface InvoiceSummary {
  id: string
  amount: string
  currency: string
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  dueDate: string
  issuedAt: string
  description: string | null
  userName: string | null  // NEW — creator's display name from User relation
}
```

**Query change** in `getInvoices`:

```ts
select: {
  id: true,
  amount: true,
  currency: true,
  status: true,
  dueDate: true,
  issuedAt: true,
  description: true,
  user: { select: { name: true } },  // NEW — single Prisma join
}
```

Mapped to `userName: inv.user.name ?? null` in the return object.

---

## New TypeScript Types

### `RegisterFormValues` — registration form shape

**File**: `lib/validations/auth.ts`

```ts
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterFormValues = z.infer<typeof registerSchema>
```

### `LoginFormValues` — login form shape

**File**: `lib/validations/auth.ts`

```ts
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

---

## Entity Relationships (unchanged)

```
User ──< Account   (one User has many OAuth accounts)
User ──< Session   (one User has many sessions)
User ──< Invoice   (one User owns many invoices)
```

Invoice.userId → User.id (cascade delete). No new relations introduced.

---

## State Transitions

### User authentication state

```
Anonymous ──[register]──► Registered (email/password)
Anonymous ──[OAuth flow]──► Registered (social account)
Registered ──[login]──► Authenticated session (JWT)
Authenticated ──[logout]──► Anonymous
Authenticated ──[session expiry]──► Anonymous → redirect to /login
```
