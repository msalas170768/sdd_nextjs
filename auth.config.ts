import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config: NO imports of pg, Prisma, or any Node.js-only module.
// Used by middleware.ts (Edge Runtime) and spread into lib/auth.ts (Node.js runtime).
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isDashboard) return isLoggedIn
      return true
    },
  },
} satisfies NextAuthConfig
