# UI Contracts: Landing Page & User Authentication

**Branch**: `003-landing-user-auth` | **Date**: 2026-05-01

---

## Navbar Component

**File**: `components/layout/Navbar.tsx` (Server Component)
**Rendered in**: `app/layout.tsx` (all routes)

### Unauthenticated state (no session)

| Element | Target | Notes |
|---------|--------|-------|
| App logo / name | `/` | Left-aligned |
| "Register" button/link | `/register` | Right side |
| "Log In" button/link | `/login` | Right side |

### Authenticated state (session present)

| Element | Target | Notes |
|---------|--------|-------|
| App logo / name | `/` | Left-aligned |
| User display name | — | Read from `session.user.name`; truncated if long |
| "Log Out" button | `signOut()` | Client Component interaction; redirects to `/` |

---

## Registration Form

**File**: `components/auth/RegisterForm.tsx` ("use client")
**Rendered on**: `app/register/page.tsx`

### Fields

| Field | Type | Validation | Error message |
|-------|------|-----------|---------------|
| Full Name | text | min 2 chars | "Name must be at least 2 characters" |
| Email | email | valid format | "Invalid email address" |
| Password | password | ≥8 chars, ≥1 letter, ≥1 number | "Password must be at least 8 characters" / "must contain at least one letter/number" |
| Confirm Password | password | must match Password | "Passwords do not match" |

### Server Action: `registerUser`

**File**: `lib/actions/users.ts`

**Input**: `RegisterFormValues`

**Happy path**:
1. Validate with `registerSchema` (Zod) — server-side authoritative check
2. Check `email` uniqueness via `db.user.findUnique({ where: { email } })`
3. Hash password with `bcryptjs.hash(password, 12)`
4. `db.user.create({ data: { name, email, password: hash } })`
5. `redirect('/login?registered=1')`

**Error cases** (returned as `{ error: string }` to the client):

| Case | Returned error |
|------|---------------|
| Email already registered | `"An account with this email already exists"` |
| Validation failure (server) | Field-level Zod error messages |

### Success state

After redirect to `/login?registered=1`, the login page shows a green banner:
`"Account created! You can now sign in."`

---

## Login Form

**File**: `components/auth/LoginForm.tsx` ("use client")
**Rendered on**: `app/login/page.tsx` (Server Component)

### Sections

1. **Email/Password form**

| Field | Type | Validation |
|-------|------|-----------|
| Email | email | valid format |
| Password | password | required (min 1 char) |

   - Submit calls `signIn('credentials', { email, password, callbackUrl: '/dashboard/invoices' })`
   - On auth failure: show inline error `"Invalid email or password"`

2. **Divider**: `── or ──`

3. **Social login buttons**

| Button | Provider | Callback URL |
|--------|----------|-------------|
| "Sign in with Google" | `google` | `/dashboard/invoices` |
| "Sign in with GitHub" | `github` | `/dashboard/invoices` |

### Query param: `?registered=1`

If present, render a success banner above the form:
`"Account created! You can now sign in."`

---

## Landing Page

**File**: `app/page.tsx` (Server Component)

### Layout sections

| Section | Content |
|---------|---------|
| Hero | Full-width gradient background; app name as headline; tagline; "Get Started" (→ `/register`) + "Sign In" (→ `/login`) CTA buttons |
| Features | 3-column card grid; icons from lucide-react; brief capability description per card |

### Feature cards content

| Icon | Title | Description |
|------|-------|-------------|
| `FileText` | Manage Invoices | Create, update, and track invoices in one place |
| `Users` | Team-Ready | Multi-user support with per-account invoice history |
| `ShieldCheck` | Secure by Default | Sign in with your existing Google or GitHub account |

---

## Invoice Table Changes

**File**: `components/invoices/InvoiceTable.tsx` + `InvoiceRow.tsx`

### Column layout (updated)

| # | Column | Source | Notes |
|---|--------|--------|-------|
| 1 | Amount | `invoice.amount` + `invoice.currency` | Unchanged |
| 2 | Description | `invoice.description` | New; empty string if null |
| 3 | Status | `invoice.status` | Unchanged (badge) |
| 4 | Due Date | `invoice.dueDate` | Unchanged |
| 5 | Issued | `invoice.issuedAt` | Unchanged |
| 6 | Created By | `invoice.userName` | New; "—" if null |
| 7 | Options | `<InvoiceActionsCell />` | Unchanged |

**Removed**: ID column (was column 1 in previous layout).

**Note**: `invoice.id` is still present in `InvoiceSummary` and used by `InvoiceActionsCell` for
navigation and delete actions — it is only hidden from display.
