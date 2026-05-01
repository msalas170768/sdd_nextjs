import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import CrudInvoice from '@/components/invoices/CrudInvoice'

interface UpdateInvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function UpdateInvoicePage({ params }: UpdateInvoicePageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const raw = await db.invoice.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!raw) notFound()

  const invoice = {
    id:          raw.id,
    amount:      Number(raw.amount),
    currency:    raw.currency,
    status:      raw.status,
    dueDate:     raw.dueDate,
    issuedAt:    raw.issuedAt,
    description: raw.description,
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Invoice</h1>
      <CrudInvoice invoice={invoice} />
    </main>
  )
}
