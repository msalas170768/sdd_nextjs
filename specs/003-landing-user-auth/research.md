# Research: Landing Page & User Authentication

**Branch**: `003-landing-user-auth` | **Date**: 2026-05-01

## Decision Log

---

### 1. Password Hashing Library

**Decision**: Use `bcryptjs` (pure-JS implementation of bcrypt).

**Rationale**: `bcrypt` (native binding) requires compilation and fails on many serverless
environments (Vercel). `bcryptjs` is fully compatible with Node.js and runs anywhere; cost
factor 12 provides adequate security for web apps. Auth.js v5 Credentials provider calls the
`authorize` function in a Node.js Server Action, so pure-JS bcrypt works fine.

**Alternatives considered**:
- `bcrypt` (native): Rejected — native binding issues on Vercel and CI.
- `argon2` via `@node-rs/argon2`: More secure but heavier; not needed at this scale; native bindings with same deployment concerns.
- `crypto.pbkdf2` (Node built-in): Works, but bcryptjs is the established convention for Auth.js Credentials examples.

---

### 2. Auth.js v5 Credentials Provider

**Decision**: Add `CredentialsProvider` with `authorize` function that queries the DB for the
user by email and uses `bcryptjs.compare` to verify the password.

**Rationale**: Auth.js v5 (next-auth beta.25) supports Credentials with the existing JWT
strategy. The `authorize` callback runs server-side only, so DB access is safe. The session
already uses `{ strategy: 'jwt' }` — no conflict.

**Key implementation notes**:
- `authorize` must return `null` on failure (not throw) for Auth.js to redirect to the error page.
- Credentials provider MUST be added to `lib/auth.ts` (Node.js runtime), NOT `auth.config.ts`
  (Edge runtime — bcrypt/Prisma are Node.js-only).
- The registration Server Action (`lib/actions/users.ts`) creates the user and then calls
  `signIn('credentials', ...)` to auto-login — or redirects to `/login` if a separate sign-in
  step is preferred. Decision: redirect to `/login` after registration to keep flows separate and
  avoid a second round-trip through `authorize`.

**Alternatives considered**:
- Auto-login after registration (call `signIn` inside Server Action): More seamless UX but
  complicates error handling and requires careful CSRF token handling. Deferred to a future UX
  polish iteration.

---

### 3. Google OAuth Provider

**Decision**: Add `Google` provider from `next-auth/providers/google`.

**Rationale**: The spec explicitly requires Google login (FR-009). Auth.js v5 has a first-class
Google provider. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.
OAuth callback URL to register in Google Cloud Console: `[ORIGIN]/api/auth/callback/google`.

**Alternatives considered**: None — Google provider is the standard Auth.js approach.

---

### 4. User Schema: password field

**Decision**: Add `password String?` (nullable) to the Prisma `User` model.

**Rationale**: The User model is shared between social-login users (no password) and
email/password users. A nullable field avoids a separate table while being safe. Social users
will have `password: null`; email/password users will have `password: <bcrypt hash>`.

**Migration**: Non-breaking — existing rows get `password: null`. No backfill needed.

---

### 5. Invoice Query: adding userName

**Decision**: Change `getInvoices` to include `user: { select: { name: true } }` in the Prisma
query and add `userName: string | null` to `InvoiceSummary`.

**Rationale**: The Invoice model already has a `userId` foreign key with a `User` relation.
Prisma can join in a single query. The `InvoiceSummary` type in `lib/invoices.ts` is used only
by the list view — adding `userName` is a backwards-compatible extension.

**Alternatives considered**:
- Separate query to fetch user name: Two DB round-trips; unnecessary.
- Denormalize user name on Invoice at write time: More complex, stale data risk.

---

### 6. Navbar Architecture

**Decision**: `Navbar.tsx` is a Server Component that calls `auth()` and passes session data as
props to `NavbarActions.tsx` (Client Component). `Navbar` is rendered in `app/layout.tsx`.

**Rationale**: `auth()` works in Server Components (no waterfalling). The logout action requires
a click handler (`onClick={() => signOut()}`), which needs `"use client"`. Pattern: Server
Component fetches session → passes to Client Component as props. This keeps the interactive
surface minimal.

**Alternatives considered**:
- Full Client Component navbar using `useSession()`: Would require `SessionProvider` wrapper in
  layout; adds client JS weight; data available server-side anyway.
- Separate `useSession()` on each page: Duplicate fetches; inconsistent.

---

### 7. Landing Page Design Approach

**Decision**: Redesign `app/page.tsx` as a Server Component with a hero section, feature
highlights, and a prominent call-to-action. Use Tailwind for all styling, Geist font (already
configured), and lucide-react icons (already installed).

**Rationale**: The existing `app/page.tsx` is a plain placeholder. The spec requires "elegant
and sophisticated." Key elements: full-viewport hero with gradient, clear value proposition, CTA
buttons linking to `/register` and `/login`, brief feature cards below the fold.

**Alternatives considered**:
- Third-party landing page library (e.g., Aceternity UI): Adds dependency; Tailwind-only approach
  is sufficient and constitution-compliant.

---

### 8. Registration Flow

**Decision**: 
1. `app/register/page.tsx` — Server Component, renders `<RegisterForm />`
2. `<RegisterForm />` — Client Component with React Hook Form + Zod (`registerSchema`)
3. On submit: calls `registerUser` Server Action
4. Server Action: validates input, checks email uniqueness, hashes password, creates User via Prisma, redirects to `/login?registered=1`
5. Login page shows a success banner when `?registered=1` query param is present.

**Rationale**: Follows the same Server Action + Client Component form pattern established in
feature 002 (`CrudInvoice`). Clean separation: form validation in client, authoritative
validation + DB write in Server Action.

**Alternatives considered**:
- Route Handler (API route): Less type-safe than Server Actions; no direct `redirect()`.

---

## Resolved NEEDS CLARIFICATION Items

None — spec had no NEEDS CLARIFICATION markers.
