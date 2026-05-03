'use client'

import { signOutAction } from '@/lib/actions/auth'

interface NavbarActionsProps {
  userName: string
}

export default function NavbarActions({ userName }: NavbarActionsProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{userName}</span>
      <button
        onClick={() => signOutAction()}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        Log Out
      </button>
    </div>
  )
}
