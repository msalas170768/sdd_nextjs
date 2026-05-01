# Feature Specification: Invoice CRUD

**Feature Branch**: `002-invoice-crud`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "CRUD operations on Invoice list with a shared CrudInvoice component for create/edit, delete confirmation dialog limited to PENDING invoices, and an options column with view/edit/delete icons."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create a New Invoice (Priority: P1)

An authenticated user clicks the "Add Invoice" button at the top of the invoice list and is
taken to a dedicated creation page. They fill in the invoice details and click Aceptar to save.
If the record is saved successfully, they are redirected back to the invoice list which
reflects the new entry. If saving fails, an error message is shown in place without leaving
the page.

**Why this priority**: Creation is the first step in the lifecycle. No other CRUD operation
has meaning without the ability to create records.

**Independent Test**: Click "Add Invoice" → fill all required fields → click Aceptar → list
reloads and shows the new invoice. Cancel → returns to list unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the invoice list, **When** they click the "Add Invoice"
   button, **Then** they are navigated to `/dashboard/create_invoice`.
2. **Given** the user is on the create page with all required fields filled, **When** they
   click Aceptar, **Then** the invoice is saved and they are redirected to the invoice list
   with the new record visible.
3. **Given** the user is on the create page, **When** the save operation fails,
   **Then** an error message describing the failure is displayed without navigating away.
4. **Given** the user is on the create page, **When** they click Cancelar,
   **Then** they are returned to the invoice list with no changes made.

---

### User Story 2 — Edit an Existing Invoice (Priority: P2)

An authenticated user clicks the Edit icon in the options column of any invoice row. They are
navigated to the edit page with the invoice fields pre-populated with current values. After
making changes and clicking Aceptar, the updated record is persisted and the user is returned
to the refreshed invoice list. Canceling returns them to the list without saving.

**Why this priority**: Editing depends on invoices already existing (P1 delivers that).
It is more critical than deletion because it covers status correction and data fixes.

**Independent Test**: Click Edit icon on any invoice row → form opens pre-filled with the
invoice's current data → change a field → Aceptar → list shows the updated values.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the invoice list, **When** they click the Edit icon
   for an invoice, **Then** they are navigated to `/dashboard/update_invoice/[id]` with all
   current invoice fields pre-populated in the `CrudInvoice` component.
2. **Given** the user has modified one or more fields and clicks Aceptar, **Then** the
   changes are persisted and the user is redirected to the refreshed invoice list.
3. **Given** the save operation fails, **Then** the error from the database is displayed
   in the form without navigating away.
4. **Given** the user clicks Cancelar, **Then** they are returned to the invoice list with
   no changes applied.
5. **Given** an unauthenticated user navigates directly to `/dashboard/update_invoice/[id]`,
   **Then** they are redirected to the login page.

---

### User Story 3 — Delete a PENDING Invoice (Priority: P3)

An authenticated user clicks the Delete icon for an invoice in PENDING status. A confirmation
dialog appears asking them to confirm or cancel the deletion. Confirming deletes the record and
refreshes the invoice list. Canceling dismisses the dialog with no change. Invoices that are
not in PENDING status cannot be deleted — their Delete icon is disabled or hidden.

**Why this priority**: Deletion is irreversible; the confirmation dialog and status restriction
make this the most guarded operation. It delivers value only after P1 and P2 establish records.

**Independent Test**: Click Delete icon on a PENDING invoice → confirmation dialog appears →
confirm → invoice no longer appears in the list. Click Delete on a PAID or OVERDUE invoice →
icon is disabled (no dialog shown).

**Acceptance Scenarios**:

1. **Given** an authenticated user on the invoice list, **When** they click the Delete icon
   for a PENDING invoice, **Then** a confirmation dialog is displayed.
2. **Given** the confirmation dialog is open, **When** the user confirms the deletion,
   **Then** the invoice is permanently removed and the list refreshes without that record.
3. **Given** the confirmation dialog is open, **When** the user cancels,
   **Then** the dialog closes and the invoice remains in the list unchanged.
4. **Given** an invoice with status PAID or OVERDUE, **When** the user views the options
   column, **Then** the Delete icon is disabled or absent — no deletion can be triggered.

---

### User Story 4 — Options Column with View, Edit, Delete Icons (Priority: P1)

The invoice list displays a dedicated options column on each row with three icon buttons:
View (navigates to the invoice detail), Edit (navigates to the edit page), and Delete
(triggers the deletion flow). Each icon is visually distinct and communicates its action.

**Why this priority**: The options column is the entry point for all CRUD operations from
the list. Without it, users cannot access edit or delete flows.

**Independent Test**: All three icons are visible on each row. Clicking View navigates to
`/dashboard/invoices/[id]`. Clicking Edit navigates to `/dashboard/update_invoice/[id]`.
Clicking Delete (on PENDING) opens the confirmation dialog.

**Acceptance Scenarios**:

1. **Given** the authenticated user is on the invoice list, **When** they view any row,
   **Then** the options column displays three distinct icons: View, Edit, Delete.
2. **Given** the user clicks the View icon, **Then** they are navigated to
   `/dashboard/invoices/[id]`.
3. **Given** the user clicks the Edit icon, **Then** they are navigated to
   `/dashboard/update_invoice/[id]`.
4. **Given** the Delete icon for a non-PENDING invoice, **Then** the icon is visually
   disabled and clicking it has no effect.

---

### Edge Cases

- What if required invoice fields (amount, due date) are left blank on submit?
  → The form prevents submission and highlights the missing fields with validation messages.
- What if a user navigates directly to `/dashboard/update_invoice/[id]` with an ID that
  does not belong to them?
  → The page returns a not-found response; the record is not exposed.
- What if the database connection is lost during a save operation?
  → The error message from the database is displayed in the `CrudInvoice` form.
- What if the user double-clicks Aceptar before the first save completes?
  → The button is disabled after the first click to prevent duplicate submissions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an "Add Invoice" button at the top of the invoice list
  that navigates to `/dashboard/create_invoice`.
- **FR-002**: System MUST display an options column on each invoice row containing View,
  Edit, and Delete icon buttons.
- **FR-003**: The View icon MUST navigate to `/dashboard/invoices/[id]` for the selected
  invoice.
- **FR-004**: The Edit icon MUST navigate to `/dashboard/update_invoice/[id]` for the
  selected invoice.
- **FR-005**: The Delete icon MUST be disabled or hidden for invoices whose status is not
  PENDING.
- **FR-006**: System MUST render the `CrudInvoice` component on both the create and edit
  pages, accepting parameters that differentiate between insert and update mode.
- **FR-007**: The `CrudInvoice` component MUST display fields for all editable invoice
  attributes: amount, currency, status, due date, issue date, and description.
- **FR-008**: The `CrudInvoice` component MUST have an Aceptar button that submits the form
  and a Cancelar button that returns the user to the invoice list without saving.
- **FR-009**: On the edit page, the `CrudInvoice` component MUST pre-populate all fields
  with the existing invoice's current values.
- **FR-010**: A successful create or edit operation MUST redirect the user to the invoice
  list, which MUST reflect the latest data.
- **FR-011**: A failed create or edit operation MUST display the database error message
  within the `CrudInvoice` form without navigating away.
- **FR-012**: The Delete action MUST display a confirmation dialog before executing the
  deletion.
- **FR-013**: Confirming deletion MUST permanently remove the invoice and refresh the list.
- **FR-014**: All routes under `/dashboard/*` MUST remain protected — unauthenticated users
  are redirected to the login page.
- **FR-015**: Users MUST only be able to create, edit, or delete their own invoices — cross-
  user access is prohibited.

### Key Entities *(include if feature involves data)*

- **Invoice**: Existing entity. Editable fields for this feature: `amount`, `currency`,
  `status` (PAID / PENDING / OVERDUE), `dueDate`, `issuedAt`, `description`. The `userId`
  is set automatically from the authenticated session and is not editable.
- **User**: Authenticated account owner. All CRUD operations are scoped to the user's
  identity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete invoice creation (form fill + submit) in under 2 minutes
  under normal conditions.
- **SC-002**: Successfully created or edited invoices appear in the refreshed invoice list
  within 2 seconds of the Aceptar action.
- **SC-003**: The deletion confirmation dialog is shown 100% of the time when the Delete
  icon is clicked on a PENDING invoice.
- **SC-004**: Zero deletions of invoices with status PAID or OVERDUE are possible through
  the UI.
- **SC-005**: Database error messages are displayed to the user within 1 second of a failed
  save operation.
- **SC-006**: The Aceptar button is disabled during submission, preventing duplicate records
  from being created.

## Assumptions

- Editable invoice fields are: amount, currency, status, dueDate, issuedAt, description.
  The `id`, `userId`, `createdAt`, and `updatedAt` fields are system-managed and not editable.
- Newly created invoices can be assigned any status (PAID, PENDING, OVERDUE) — the status
  field is part of the creation form.
- The View icon in the options column links to the existing detail route
  `/dashboard/invoices/[id]` (plural), consistent with the current implementation.
- The "Add Invoice" button is placed in the header area of the invoice list page, above the
  table.
- The `CrudInvoice` component determines its mode (create vs. edit) via the route it is
  rendered on — no explicit mode prop is required from the page if route context is
  sufficient.
- The confirmation dialog for deletion is a modal overlay; it does not navigate away from
  the list page.
- Only the authenticated user's own invoices are listed and accessible for CRUD operations.
- Form validation (required fields, valid date formats, positive amount) happens client-side
  before submission; server-side validation is the authoritative gate.
