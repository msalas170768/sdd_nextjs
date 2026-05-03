# Tasks: Landing Page & User Authentication

**Input**: Design documents from `/specs/003-landing-user-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no cross-dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Install new dependency required by the Credentials auth provider.

- [x] T001 Install bcryptjs and its TypeScript types by running `npm install bcryptjs` and `npm install -D @types/bcryptjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema migration, auth provider wiring, and shared type/query changes that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `password String?` field to the `User` model in `prisma/schema.prisma` (nullable; social-only accounts remain null; see data-model.md)
- [x] T003 Run `npx prisma migrate dev --name add-user-password` to apply the schema change and regenerate the Prisma client
- [x] T004 Add `CredentialsProvider` (with `authorize` using `bcryptjs.compare`) and `Google` provider to `lib/auth.ts`; keep the existing `GitHub` provider; note: Credentials and bcrypt imports must stay in `lib/auth.ts` (Node.js runtime only, NOT in `auth.config.ts` which runs on the Edge)
- [x] T005 [P] Create `lib/validations/auth.ts` with `registerSchema` and `loginSchema` (Zod v4) and their exported `RegisterFormValues` and `LoginFormValues` types as defined in `specs/003-landing-user-auth/data-model.md`
- [x] T006 [P] Modify `lib/invoices.ts`: extend `InvoiceSummary` interface with `userName: string | null`, add `user: { select: { name: true } }` to the `getInvoices` Prisma select, and map `userName: inv.user.name ?? null` in the return object

**Checkpoint**: Schema migrated, all three auth providers wired, shared types and query updated — user story implementation can begin.

---

## Phase 3: User Story 1 — Landing Page & Navbar (Priority: P1) 🎯 MVP

**Goal**: Replace the minimal `app/page.tsx` with an elegant, sophisticated landing page and add a persistent navbar to every route that shows Register/Login when unauthenticated and the user's name with a logout option when authenticated.

**Independent Test**: Open `http://localhost:3000` without logging in — elegant landing page renders; toolbar shows "Register" and "Log In". Log in via any provider — toolbar shows display name and "Log Out". Click "Log Out" — redirected to `/` with toolbar back to unauthenticated state.

- [x] T007 [P] [US1] Create `lib/actions/auth.ts` with a `signOutAction` Server Action (`'use server'`) that calls `signOut({ redirectTo: '/' })` from `next-auth`; this file is the server-side bridge that lets Client Components trigger logout without `SessionProvider`
- [x] T008 [P] [US1] Create `components/layout/NavbarActions.tsx` as a `"use client"` component that accepts `userName: string` as a prop and renders the user's display name plus a "Log Out" button that calls `signOutAction` from `lib/actions/auth.ts` on click
- [x] T009 [US1] Create `components/layout/Navbar.tsx` as a Server Component that calls `auth()` from `lib/auth`, then conditionally renders: (a) "Register" (`/register`) and "Log In" (`/login`) links when no session; (b) `<NavbarActions userName={session.user.name ?? 'User'} />` when authenticated; also render the application name/logo as a left-aligned link to `/`
- [x] T010 [US1] Update `app/layout.tsx` to import and render `<Navbar />` above `{children}`; keep all existing metadata and font configuration unchanged
- [x] T011 [US1] Redesign `app/page.tsx` as an elegant Server Component landing page with: (a) a full-viewport hero section with a gradient background, the application name as the headline, a brief tagline, and two CTA buttons — "Get Started" (→ `/register`) and "Sign In" (→ `/login`); (b) a 3-column feature card grid below the fold using `lucide-react` icons (`FileText`, `Users`, `ShieldCheck`) with titles and descriptions from `specs/003-landing-user-auth/contracts/ui.md`; use Tailwind CSS exclusively (Geist font already configured in layout)

**Checkpoint**: Landing page is visually complete and Navbar correctly reflects auth state across all routes.

---

## Phase 4: User Story 2 — User Registration (Priority: P2)

**Goal**: Allow a new visitor to create an email/password account via a registration form, after which they are redirected to the login page with a success confirmation banner.

**Independent Test**: Navigate to `/register`, submit the form with valid data (name, email, password, confirmPassword) — redirected to `/login?registered=1`. Attempt to register again with the same email — inline error "An account with this email already exists".

- [x] T012 [P] [US2] Create `lib/actions/users.ts` with the `registerUser` Server Action: validate input with `registerSchema`, check email uniqueness via `db.user.findUnique`, hash password with `bcryptjs.hash(password, 12)`, create user with `db.user.create`, and call `redirect('/login?registered=1')`; return `{ error: string }` for duplicate email or validation failures
- [x] T013 [P] [US2] Create `components/auth/RegisterForm.tsx` as a `"use client"` component: React Hook Form with `zodResolver(registerSchema)`, four fields (Full Name, Email, Password, Confirm Password), inline validation error messages per field, calls `registerUser` Server Action on submit, and shows a form-level error message if the action returns an `error` property
- [x] T014 [US2] Create `app/register/page.tsx` as a Server Component that renders the page title "Create an account" and the `<RegisterForm />` component; accessible to unauthenticated visitors (already public under current `auth.config.ts` rules)

**Checkpoint**: Registration flow fully functional — new users can create accounts independently of the login flow.

---

## Phase 5: User Story 3 — User Login (Priority: P3)

**Goal**: Allow existing users to sign in via email/password or via Google and GitHub OAuth; after login, redirect to `/dashboard/invoices`.

**Independent Test**: Enter valid email/password on `/login` — redirected to `/dashboard/invoices`. Click Google/GitHub buttons — OAuth flow completes and redirects to `/dashboard/invoices`. Enter invalid credentials — inline error displays without revealing which field is wrong.

- [x] T015 [P] [US3] Create `lib/actions/auth.ts` (if not already created in T007) — add a `credentialsSignIn` Server Action that calls `signIn('credentials', { email, password, redirectTo: '/dashboard/invoices' })` from `next-auth`; add `googleSignIn` and `githubSignIn` Server Actions calling `signIn('google', ...)` and `signIn('github', ...)` respectively with `redirectTo: '/dashboard/invoices'`
- [x] T016 [US3] Create `components/auth/LoginForm.tsx` as a `"use client"` component: React Hook Form with `zodResolver(loginSchema)` for the email/password section, calls `credentialsSignIn` on submit and shows `"Invalid email or password"` on failure; renders an `── or ──` divider; renders "Sign in with Google" and "Sign in with GitHub" buttons that invoke `googleSignIn` and `githubSignIn` Server Actions respectively; accepts an optional `registered` boolean prop — when true, renders a green success banner "Account created! You can now sign in."
- [x] T017 [US3] Modify `app/login/page.tsx` — convert to a Server Component: read `searchParams.registered` and pass `registered={!!searchParams.registered}` as a prop to `<LoginForm />`; remove the existing `"use client"` directive and `signIn` import from `next-auth/react`

**Checkpoint**: All three login methods functional; registration success banner appears correctly.

---

## Phase 6: User Story 4 — Enhanced Invoice List (Priority: P4)

**Goal**: The Invoice list displays a Description column and a Created By (user name) column, and no longer shows the internal ID column.

**Independent Test**: Log in and navigate to `/dashboard/invoices` — table columns are Amount, Description, Status, Due Date, Issued, Created By, Options. The ID column is absent. Invoices with a description show text in the Description column; invoices created by a registered user show their name in Created By.

- [x] T018 [P] [US4] Modify `components/invoices/InvoiceTable.tsx` — remove the "ID" `<th>` column header; add "Description" `<th>` header after Amount; add "Created By" `<th>` header after Issued; column order must match `specs/003-landing-user-auth/contracts/ui.md` table layout
- [x] T019 [P] [US4] Modify `components/invoices/InvoiceRow.tsx` — remove the ID `<td>` cell (the link `href=invoice.id` cell); add a `<td>` for `invoice.description` (display as empty string if null); add a `<td>` for `invoice.userName` (display as "—" if null); update the `InvoiceRowProps` type to use the new `InvoiceSummary` (which now includes `userName`)

**Checkpoint**: Invoice list shows the new columns and no longer exposes the internal ID to users.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories.

- [x] T020 Run `npx tsc --noEmit` and resolve any TypeScript errors — ensure no `any` types, all new components have explicit prop interfaces, and Server Action return types are declared
- [ ] T021 Follow `specs/003-landing-user-auth/quickstart.md` smoke test checklist end-to-end: landing page, registration, email/password login, Google login, GitHub login, logout, protected route redirect, invoice list column verification, duplicate email error

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — **BLOCKS all user stories**
- **User Stories (Phase 3–6)**: All depend on Phase 2 completion
  - US1 depends on: T004 (auth providers), T003 (migration) for Navbar auth() call
  - US2 depends on: T002+T003 (schema + migration), T005 (registerSchema)
  - US3 depends on: T004 (Credentials + Google providers), T005 (loginSchema)
  - US4 depends on: T006 (InvoiceSummary.userName query change)
- **Polish (Phase 7)**: Depends on all user stories

### Within Each User Story

- US1: T007 and T008 can run in parallel → T009 (imports T008) → T010 (imports T009) → T011 (independent of T007–T010 but all deploy together)
- US2: T012 and T013 can run in parallel (T012 needs T005, T013 needs T005) → T014 (imports T013)
- US3: T015 can be merged with T007 if `lib/actions/auth.ts` already exists → T016 (needs T015) → T017 (needs T016)
- US4: T018 and T019 can run in parallel (different files, both need T006)

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2/US3/US4
- **US2 (P2)**: Can start after Phase 2 — no dependency on US1/US3/US4
- **US3 (P3)**: Can start after Phase 2 — no dependency on US1/US2/US4
- **US4 (P4)**: Can start after T006 (Foundational) — no dependency on US1/US2/US3

---

## Parallel Example: Phase 2 (Foundational)

```
# After T001 completes, T002–T006 can be started:

Parallel stream A:  T002 → T003 → T004  (schema → migrate → auth providers)
Parallel stream B:  T005               (Zod schemas — fully independent)
Parallel stream C:  T006               (invoices.ts query — fully independent)
```

## Parallel Example: User Story 1

```
# After Phase 2 complete:

Parallel stream A:  T007  (lib/actions/auth.ts signOutAction)
Parallel stream B:  T008  (NavbarActions.tsx)
  → then:           T009  (Navbar.tsx — imports T008)
  → then:           T010  (layout.tsx — imports T009)
Parallel stream C:  T011  (app/page.tsx — independent of navbar)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006)
3. Complete Phase 3: User Story 1 (T007–T011)
4. **STOP and VALIDATE**: Landing page + Navbar work; auth state visible
5. Continue with US2 registration to make auth end-to-end

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Elegant landing page + Navbar (MVP public face)
3. Phase 4 (US2) → Registration flow
4. Phase 5 (US3) → Full login (email/password + Google + GitHub)
5. Phase 6 (US4) → Enhanced Invoice list
6. Phase 7 → Polish + smoke test

---

## Notes

- `lib/actions/auth.ts` is referenced in both T007 (signOutAction) and T015 (credentialsSignIn, googleSignIn, githubSignIn) — implement both together in a single file
- `bcryptjs` calls (`hash`, `compare`) are Node.js-only — never import in `auth.config.ts` or Edge middleware
- `prisma/schema.prisma` change (T002) is non-breaking — existing rows get `password: null`
- `invoice.id` is still in `InvoiceSummary` and used by `InvoiceActionsCell` for navigation; only the display column is removed (T018/T019)
- No `SessionProvider` is needed — auth state is read server-side via `auth()` in Navbar; logout and social login use Server Actions
