'use client'

import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in</h1>
        <button
          onClick={() => signIn('github', { callbackUrl: '/dashboard/invoices' })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    </main>
  )
}
