import Link from 'next/link'
import { auth } from '@/lib/auth'
import NavbarActions from './NavbarActions'

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          Invoice Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <NavbarActions userName={session.user.name ?? 'User'} />
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
