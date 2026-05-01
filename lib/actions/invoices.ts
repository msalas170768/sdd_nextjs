'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invoiceSchema, type InvoiceFormValues } from '@/lib/validations/invoice'

export async function createInvoice(
  data: InvoiceFormValues,
): Promise<{ error: string } | never> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  let validated: InvoiceFormValues
  try {
    validated = invoiceSchema.parse(data)
  } catch {
    return { error: 'Invalid form data' }
  }

  try {
    await db.invoice.create({
      data: {
        amount:      validated.amount,
        currency:    validated.currency,
        status:      validated.status,
        dueDate:     validated.dueDate,
        issuedAt:    validated.issuedAt,
        description: validated.description ?? null,
        userId:      session.user.id,
      },
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Database error' }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice(
  id: string,
  data: InvoiceFormValues,
): Promise<{ error: string } | never> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  let validated: InvoiceFormValues
  try {
    validated = invoiceSchema.parse(data)
  } catch {
    return { error: 'Invalid form data' }
  }

  const existing = await db.invoice.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return { error: 'Invoice not found' }

  try {
    await db.invoice.update({
      where: { id },
      data: {
        amount:      validated.amount,
        currency:    validated.currency,
        status:      validated.status,
        dueDate:     validated.dueDate,
        issuedAt:    validated.issuedAt,
        description: validated.description ?? null,
      },
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Database error' }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string): Promise<{ error: string } | never> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const invoice = await db.invoice.findFirst({ where: { id, userId: session.user.id } })
  if (!invoice) return { error: 'Invoice not found' }
  if (invoice.status !== 'PENDING') return { error: 'Only PENDING invoices can be deleted' }

  try {
    await db.invoice.delete({ where: { id } })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Database error' }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}
