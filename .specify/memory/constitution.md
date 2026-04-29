<!--
  SYNC IMPACT REPORT
  Version change: N/A (all placeholders) → 1.0.0
  Modified principles: All (initial population from prompts/constitution.md)
    - [PRINCIPLE_1_NAME] → I. App Router First
    - [PRINCIPLE_2_NAME] → II. Server Components by Default
    - [PRINCIPLE_3_NAME] → III. Tailwind CSS for All Styling
    - [PRINCIPLE_4_NAME] → IV. Strict TypeScript Everywhere
    - [PRINCIPLE_5_NAME] → (removed — user supplied 4 principles)
  Added sections:
    - Technology Stack (replaces [SECTION_2_NAME])
    - Development Workflow (replaces [SECTION_3_NAME])
  Removed sections: N/A (first real version)
  Templates requiring updates:
    ✅ .specify/memory/constitution.md — this file
    ✅ .specify/templates/plan-template.md — Constitution Check section reads
         "[Gates determined based on constitution file]"; gates are derived
         dynamically by /speckit-plan from this constitution (no static edit needed)
    ✅ .specify/templates/spec-template.md — no changes required; existing
         mandatory sections (User Scenarios, Requirements, Success Criteria)
         are compatible with these principles
    ✅ .specify/templates/tasks-template.md — no structural changes required;
         paths in task examples are generic placeholders filled per feature
  Follow-up TODOs: None — all placeholders resolved
-->

# SDD Next.js Constitution

## Core Principles

### I. App Router First (NON-NEGOTIABLE)

The Next.js App Router MUST be used exclusively. The Pages Router (`pages/` directory) is
prohibited. All routes MUST live under the `app/` directory and follow App Router conventions
(layouts, loading states, error boundaries, route groups).

Any code that imports from `next/router` (Pages Router) instead of `next/navigation` (App Router)
MUST be rejected in review. Boilerplate or AI-generated code using the Pages Router MUST be
corrected before committing.

**Rationale**: The Pages Router is a legacy architecture. Mixing it with the App Router creates
routing inconsistency and blocks access to React Server Components and streaming.

### II. Server Components by Default

React Server Components MUST be the default for all UI. The `"use client"` directive MUST only
be added when a component genuinely requires one of the following:

- Browser-only APIs (`window`, `document`, `localStorage`, etc.)
- Interactive event handlers (`onClick`, `onChange`, form submission, etc.)
- Stateful or lifecycle hooks (`useState`, `useEffect`, `useRef`, etc.)

Data fetching MUST happen in Server Components. Fetched data MUST be passed as props to Client
Components — fetching inside Client Components is prohibited unless there is no server-side
alternative (e.g., real-time subscriptions).

**Rationale**: Server Components reduce client bundle size, improve initial load performance, and
keep sensitive data (API keys, DB queries) server-side. Unnecessary `"use client"` directives
undermine these benefits.

### III. Tailwind CSS for All Styling

Tailwind CSS MUST be the sole styling mechanism. The following are prohibited:

- CSS Modules (`.module.css` / `.module.scss`)
- CSS-in-JS libraries (styled-components, Emotion, Stitches, etc.)
- Inline `style` props, except for truly dynamic values that cannot be expressed as Tailwind
  utility classes (e.g., a runtime-calculated `width` pixel value)
- Custom global CSS beyond the Tailwind base layer in `globals.css`

**Rationale**: A single styling system prevents style conflicts, eliminates context-switching,
and keeps the design system consistent and auditable through utility classes.

### IV. Strict TypeScript Everywhere

TypeScript MUST be used in strict mode (`"strict": true` in `tsconfig.json`) across all source
files. The following are prohibited:

- The `any` type — use `unknown` and narrow with type guards, or define a precise type
- `// @ts-ignore` or `// @ts-expect-error` without an explicit inline explanation of why
- Untyped parameters or missing return types on exported functions
- Implicit `any` arising from missing type annotations

All React components MUST define explicit prop types (interface or type alias). All API route
handlers in `app/api/` MUST define typed request and response shapes.

**Rationale**: Strict TypeScript catches bugs at compile time, improves IDE support, and makes
large-scale refactoring safe. Permissive TypeScript provides false confidence without the
correctness guarantees.

## Technology Stack

This project mandates the following technology choices. Introducing alternatives that conflict
with the Core Principles requires a constitution amendment first.

- **Framework**: Next.js — App Router exclusively (Principle I)
- **Component model**: React Server Components by default (Principle II)
- **Styling**: Tailwind CSS only (Principle III)
- **Language**: TypeScript in strict mode (Principle IV)
- **Package manager**: npm — do not mix package managers within the same repository

Third-party UI component libraries are permitted only if they support Server Components or
expose headless/unstyled components compatible with Tailwind, and do not require CSS-in-JS.

## Development Workflow

- Every implementation plan MUST include a Constitution Check gate verifying compliance with
  all four Core Principles before development begins, and again after the design phase.
- Code review MUST reject any PR that violates a Core Principle without an explicit documented
  justification and a corresponding constitution amendment.
- AI-generated code MUST be reviewed against this constitution before committing. Generated
  Pages Router code, CSS Modules, or untyped components MUST be corrected.
- Adding a new styling system, routing paradigm, or language requires amending this constitution
  and incrementing its version before any implementation work begins.

## Governance

This constitution supersedes all other coding guidelines, AI defaults, and framework boilerplate
that conflict with its principles. In case of conflict, this document wins.

**Amendment procedure**: Amendments require (1) documenting the proposed change and its rationale,
(2) updating this file with an incremented semantic version, and (3) propagating changes to any
dependent templates listed in the Sync Impact Report.

**Versioning policy**:
- MAJOR — principle removal, redefinition, or backward-incompatible governance change
- MINOR — new principle or section added, or materially expanded guidance
- PATCH — clarifications, wording fixes, non-semantic refinements

**Compliance review**: Every implementation plan's Constitution Check gate is the formal
compliance checkpoint. Violations noted there MUST be resolved or explicitly justified (with
entry in the plan's Complexity Tracking table) before implementation proceeds.

**Version**: 1.0.0 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
