# Quickstart: Landing Page & User Authentication

**Branch**: `003-landing-user-auth` | **Date**: 2026-05-01

## Prerequisites

These must be complete before starting implementation:

- [ ] Existing project runs (`npm run dev` works on `main`)
- [ ] PostgreSQL DB is accessible (connection string in `.env`)
- [ ] Auth.js GitHub OAuth already configured (`GITHUB_ID`, `GITHUB_SECRET` in `.env`)

---

## Step 1 — Install bcryptjs

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## Step 2 — Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret into `.env`:

```env
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

## Step 3 — Migrate Database Schema

Add `password` field to the User model:

```bash
npx prisma migrate dev --name add-user-password
```

Verify the migration ran:

```bash
npx prisma studio
# Open User table — should show a new nullable 'password' column
```

---

## Step 4 — Run the Dev Server

```bash
npm run dev
```

---

## Step 5 — Smoke Test Checklist

### Landing Page

- [ ] Navigate to `http://localhost:3000` — elegant landing page with hero section renders
- [ ] Toolbar shows "Register" and "Log In" (not authenticated)
- [ ] "Get Started" CTA links to `/register`; "Sign In" CTA links to `/login`
- [ ] Feature cards render with icons and descriptions

### Registration

- [ ] Navigate to `/register`
- [ ] Submit empty form — all four field errors display
- [ ] Submit mismatched passwords — "Passwords do not match" error shows
- [ ] Submit valid data — redirected to `/login?registered=1`
- [ ] Login page shows green "Account created!" banner

### Email/Password Login

- [ ] On `/login`, enter the email and password from registration
- [ ] Click "Sign in" — redirected to `/dashboard/invoices`
- [ ] Toolbar shows user display name and "Log Out" option

### Google Login

- [ ] Click "Sign in with Google" on `/login`
- [ ] Complete Google OAuth flow — redirected to `/dashboard/invoices`
- [ ] Toolbar shows Google account display name

### GitHub Login

- [ ] Click "Sign in with GitHub" on `/login`
- [ ] Complete GitHub OAuth flow — redirected to `/dashboard/invoices`
- [ ] Toolbar shows GitHub display name

### Logout

- [ ] Click "Log Out" in toolbar — redirected to `/`
- [ ] Toolbar shows "Register" and "Log In" again

### Protected Route

- [ ] While logged out, navigate to `/dashboard/invoices` — redirected to `/login`

### Invoice List Columns

- [ ] Log in and navigate to `/dashboard/invoices`
- [ ] Verify columns: Amount, Description, Status, Due Date, Issued, Created By, Options
- [ ] Verify ID column is NOT visible
- [ ] Verify "Created By" shows your display name (or "—" for invoices created before this feature)

### Duplicate Email

- [ ] Attempt to register with an already-registered email
- [ ] Error "An account with this email already exists" displays
- [ ] Form remains open (no redirect)

---

## Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://...

# Auth.js
AUTH_SECRET=<random-32-char-secret>

# GitHub OAuth (existing)
GITHUB_ID=<github-oauth-app-client-id>
GITHUB_SECRET=<github-oauth-app-client-secret>

# Google OAuth (new)
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```
