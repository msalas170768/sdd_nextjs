'use server'

import { signIn, signOut } from '@/lib/auth'

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}

export async function credentialsSignIn(email: string, password: string): Promise<void> {
  await signIn('credentials', { email, password, redirectTo: '/dashboard/invoices' })
}

export async function googleSignIn(): Promise<void> {
  await signIn('google', { redirectTo: '/dashboard/invoices' })
}

export async function githubSignIn(): Promise<void> {
  await signIn('github', { redirectTo: '/dashboard/invoices' })
}
