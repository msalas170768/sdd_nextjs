# Quickstart: Invoice Dashboard

**Feature**: Invoice Dashboard | **Branch**: `001-invoice-dashboard`

## Prerequisites

- Node.js 18+
- PostgreSQL instance (local or remote)
- Environment variables configured (see below)

## Environment Variables

Create a `.env.local` file at the repository root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sdd_nextjs"
AUTH_SECRET="<random-string-min-32-chars>"
AUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

## Setup Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Apply the Prisma schema** (creates the `Invoice` table)

   ```bash
   npx prisma db push
   ```

3. **Seed test data** (optional — creates sample invoices for development)

   ```bash
   npx prisma db seed
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Sign in and open the invoice dashboard**

   Navigate to `http://localhost:3000` → complete auth → go to `/dashboard/invoices`.

## Validation Checklist

- [ ] Invoice list renders at `/dashboard/invoices` with real data
- [ ] Each invoice row is clickable and navigates to `/dashboard/invoices/[id]`
- [ ] Detail page at `/dashboard/invoices/[id]` shows the correct invoice
- [ ] Skeleton loaders appear during route transitions (test with Network throttling)
- [ ] Navigating to `/dashboard/invoices` while logged out redirects to login
- [ ] Navigating to `/dashboard/invoices/<other-user-id>` returns not-found
- [ ] TypeScript compiles with zero errors: `npx tsc --noEmit`
- [ ] No `pages/` directory exists in the project
- [ ] No `.module.css` files exist in the project
- [ ] No `any` type usages: `npx tsc --noEmit` passes with `"strict": true`
