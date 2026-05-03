'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'

interface RegisterResult {
  error: string
}

export async function registerUser(
  formData: unknown,
): Promise<RegisterResult | void> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { error: firstError }
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'An account with this email already exists' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, password: hashedPassword } })

  redirect('/login?registered=1')
}
