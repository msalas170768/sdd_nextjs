# Feature Specification: Invoice Dashboard

**Feature Branch**: `001-invoice-dashboard`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "User must see a summary of their latest invoices. Clicking a row should navigate to a dynamic route /dashboard/invoices/[id]. Loading states must use React Suspense with skeleton loaders."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Invoice List (Priority: P1)

An authenticated user navigates to the invoices section of the dashboard and immediately sees a
summarized list of their most recent invoices. Each row displays key information at a glance so
the user can assess their billing status without opening individual records.

**Why this priority**: This is the primary entry point of the feature. All other stories depend
on the list being visible and accurate.

**Independent Test**: Navigate to `/dashboard/invoices` while logged in. A table of invoices
renders with at least invoice ID, amount, status, and date visible per row. The page is fully
functional and delivers value on its own.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to `/dashboard/invoices`,
   **Then** a list of their latest invoices is displayed in a table.
2. **Given** an authenticated user with no invoices, **When** they navigate to
   `/dashboard/invoices`, **Then** an empty-state message is shown.
3. **Given** an unauthenticated visitor, **When** they navigate to `/dashboard/invoices`,
   **Then** they are redirected to the login page.

---

### User Story 2 — Navigate to Invoice Detail (Priority: P2)

From the invoice list, a user clicks any invoice row and is taken to a dedicated detail page
for that invoice at `/dashboard/invoices/[id]`, where they can view the full record.

**Why this priority**: Depends on User Story 1. The detail view adds depth but the list alone
is a viable MVP.

**Independent Test**: Clicking any invoice row navigates to `/dashboard/invoices/<id>` and
renders that invoice's full details. Manually entering a valid URL also works.

**Acceptance Scenarios**:

1. **Given** a user on the invoice list, **When** they click a row,
   **Then** they are navigated to `/dashboard/invoices/[id]` for that invoice.
2. **Given** a user navigating directly to `/dashboard/invoices/[id]`,
   **When** the ID belongs to their account, **Then** the invoice detail page renders.
3. **Given** a user navigating to `/dashboard/invoices/[id]`,
   **When** the ID does not belong to their account or does not exist,
   **Then** a not-found or access-denied page is shown.

---

### User Story 3 — Skeleton Loading States (Priority: P3)

While invoice data is being fetched, the user sees placeholder skeleton loaders that match the
shape of the content, providing visual feedback and preventing layout shift.

**Why this priority**: A quality-of-life improvement over User Stories 1 and 2. The feature
functions without it but the user experience is degraded.

**Independent Test**: On a slow connection (or simulated delay), navigating to the invoice list
or detail page shows an animated skeleton in place of content before data appears.

**Acceptance Scenarios**:

1. **Given** any navigation to `/dashboard/invoices` or `/dashboard/invoices/[id]`,
   **When** data is not yet available, **Then** an animated skeleton loader matching the
   content layout is displayed immediately.
2. **Given** data loads successfully, **When** the fetch completes,
   **Then** the skeleton is replaced by the real content without a visible flash.

---

### Edge Cases

- What happens when an invoice ID in the URL is malformed or non-existent?
  → Show a not-found page; do not expose error details.
- How does the list behave if the user has hundreds of invoices?
  → Show the most recent 20; pagination is out of scope for this feature.
- What if the database is unreachable during a request?
  → Show an error boundary with a user-friendly message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of the authenticated user's latest invoices on
  `/dashboard/invoices`, ordered by most recent first.
- **FR-002**: System MUST show at minimum invoice ID, amount, currency, status, and issue
  date per row in the invoice list.
- **FR-003**: System MUST navigate to `/dashboard/invoices/[id]` when a user clicks an
  invoice row.
- **FR-004**: System MUST display full invoice details on the `/dashboard/invoices/[id]`
  page, restricted to invoices owned by the authenticated user.
- **FR-005**: System MUST show skeleton loaders during data fetching on both the list and
  detail pages.
- **FR-006**: System MUST protect all routes under `/dashboard/` — unauthenticated requests
  MUST be redirected to the login page.
- **FR-007**: System MUST return a not-found response when an invoice ID does not exist or
  does not belong to the current user.
- **FR-008**: System MUST limit the invoice list to the 20 most recent invoices per user.

### Key Entities *(include if feature involves data)*

- **Invoice**: Represents a financial record. Key attributes: unique ID, amount, currency,
  status (PAID / PENDING / OVERDUE), due date, issue date, optional description. Associated
  with a single user.
- **User**: The authenticated account owner. Invoices are scoped to the user's identity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The invoice list is visible to an authenticated user within 2 seconds of
  navigating to `/dashboard/invoices` under normal conditions.
- **SC-002**: Navigation from the invoice list to a detail page completes within 1 second.
- **SC-003**: Skeleton loaders appear within 100 milliseconds of initiating a route
  transition, before any content renders.
- **SC-004**: 100% of invoice rows navigate to the correct detail route for the selected
  invoice.
- **SC-005**: Unauthenticated access to any `/dashboard/*` route results in a redirect to
  the login page 100% of the time.

## Assumptions

- The authentication system (NextAuth.js or Clerk) is already configured or will be set up
  as part of this feature.
- Invoices are pre-existing records in the database; this feature does not include invoice
  creation or editing.
- "Latest invoices" means the 20 most recently issued invoices for the current user.
- Invoice statuses are fixed values: PAID, PENDING, OVERDUE.
- The database (PostgreSQL via Prisma) is already provisioned; this feature adds the
  Invoice model and migration.
- Mobile responsiveness is desirable but not a hard requirement for this iteration.
