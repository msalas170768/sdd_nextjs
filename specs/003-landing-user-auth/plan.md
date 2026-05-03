# Implementation Plan: Landing Page & User Authentication

**Branch**: `003-landing-user-auth` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-landing-user-auth/spec.md`

## Summary

Replace the minimal root page with an elegant landing page and add a persistent navbar to every
route. Extend Auth.js v5 with Credentials (email + password) and Google OAuth providers alongside
the existing GitHub OAuth. Add a new registration page and update the login page to support all
three methods. Protect all `/dashboard/*` routes (already enforced by middleware); redirect to
`/dashboard/invoices` on successful login/register. Modify the Invoice list to remove the ID
column and add Description and Created By (user name) columns, requiring a small query change to
join the User relation.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router), Auth.js v5 (next-auth beta.25),
Prisma 7 + PrismaAdapter, Tailwind CSS 4, Shadcn/ui (base-nova), Zod v4,
React Hook Form v7, lucide-react, bcryptjs (NEW)
**Storage**: PostgreSQL via Prisma ORM — schema change: add `password String?` to User model
**Testing**: TypeScript compiler as primary gate; manual smoke test per quickstart.md
**Target Platform**: Web — server-rendered with Client Component islands for interactivity
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Landing page load < 1.5s; auth form submit → redirect < 2s (SC-001/002)
**Constraints**: All `/dashboard/*` routes require authentication; Prisma/bcrypt calls only in
Server Components or Server Actions; `"use client"` only on interactive form components and
navbar logout button; social login account linking is out of scope
**Scale/Scope**: Single-user namespace (invoices scoped to session user); no multi-tenancy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-Design | Post-Design |
|-----------|------|-----------|-------------|
| I. App Router First | New routes under `app/register/` and modifications to `app/login/`; `next/navigation` for redirects; no `pages/` usage; Navbar in `app/layout.tsx` | ✅ PASS | ✅ PASS |
| II. Server Components by Default | `Navbar`, `app/page.tsx`, `app/register/page.tsx`, `app/login/page.tsx` are Server Components; only `NavbarActions`, `RegisterForm`, `LoginForm` are `"use client"` (event handlers + form hooks); all DB calls in Server Actions only | ✅ PASS | ✅ PASS |
| III. Tailwind CSS for All Styling | All new components use Tailwind only; bcryptjs has no CSS; no CSS Modules introduced | ✅ PASS | ✅ PASS |
| IV. Strict TypeScript Everywhere | All new types explicit (`RegisterFormValues`, `LoginFormValues`, updated `InvoiceSummary`); no `any`; Server Action return types declared | ✅ PASS | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/003-landing-user-auth/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui.md            # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created here)
```

### Source Code (repository root)

```text
app/
├── page.tsx                               # MODIFIED: elegant landing page (Server Component)
├── layout.tsx                             # MODIFIED: add <Navbar /> to root layout
├── login/
│   └── page.tsx                           # MODIFIED: email/password + Google + GitHub
├── register/
│   └── page.tsx                           # NEW: Server Component; renders <RegisterForm />
└── dashboard/
    └── invoices/
        └── page.tsx                       # MODIFIED: uses updated getInvoices (with userName)

components/
├── layout/
│   ├── Navbar.tsx                         # NEW: Server Component — reads auth(), passes to client
│   └── NavbarActions.tsx                  # NEW: "use client" — logout button + user display
├── auth/
│   ├── RegisterForm.tsx                   # NEW: "use client" — React Hook Form + Zod registration
│   └── LoginForm.tsx                      # NEW: "use client" — React Hook Form + Zod + social btns
└── invoices/
    ├── InvoiceTable.tsx                   # MODIFIED: remove ID column, add Description + Created By
    └── InvoiceRow.tsx                     # MODIFIED: render description + userName, remove ID cell

lib/
├── auth.ts                                # MODIFIED: add Google + Credentials providers
├── invoices.ts                            # MODIFIED: InvoiceSummary gains userName; query joins user
├── actions/
│   └── users.ts                           # NEW: registerUser Server Action (hash + create + signIn)
└── validations/
    └── auth.ts                            # NEW: registerSchema + loginSchema (Zod)

prisma/
└── schema.prisma                          # MODIFIED: User model — add password String?
```

**Structure Decision**: Single Next.js App Router project. Auth components isolated under
`components/auth/`; layout components under `components/layout/`. Server Actions in `lib/actions/`.
Zod schemas in `lib/validations/`. Follows conventions from feature 002.

## Complexity Tracking

> No constitution violations requiring justification.
