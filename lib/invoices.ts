import { db } from '@/lib/db'

export interface InvoiceSummary {
  id: string
  amount: string
  currency: string
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  dueDate: string
  issuedAt: string
  description: string | null
  userName: string | null
}

export interface InvoiceDetail extends InvoiceSummary {
  createdAt: string
  updatedAt: string
}

export async function getInvoices(userId: string): Promise<InvoiceSummary[]> {
  const invoices = await db.invoice.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      dueDate: true,
      issuedAt: true,
      description: true,
      user: { select: { name: true } },
    },
  })

  return invoices.map((inv) => ({
    id: inv.id,
    amount: inv.amount.toString(),
    currency: inv.currency,
    status: inv.status,
    dueDate: inv.dueDate.toISOString(),
    issuedAt: inv.issuedAt.toISOString(),
    description: inv.description,
    userName: inv.user.name ?? null,
  }))
}

export async function getInvoiceById(
  invoiceId: string,
  userId: string,
): Promise<InvoiceDetail | null> {
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: { user: { select: { name: true } } },
  })

  if (!invoice) return null

  return {
    id: invoice.id,
    amount: invoice.amount.toString(),
    currency: invoice.currency,
    status: invoice.status,
    dueDate: invoice.dueDate.toISOString(),
    issuedAt: invoice.issuedAt.toISOString(),
    description: invoice.description,
    userName: invoice.user.name ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  }
}
