import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Uses only the Edge-compatible config — no pg, no Prisma, no Node.js crypto.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/dashboard/:path*'],
}
