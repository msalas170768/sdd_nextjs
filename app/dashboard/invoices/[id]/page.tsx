import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getInvoiceById } from '@/lib/invoices'
import InvoiceDetailComponent from '@/components/invoices/InvoiceDetail'
import Link from 'next/link'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params
  const session = await auth()
  const invoice = await getInvoiceById(id, session!.user!.id!)

  if (!invoice) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard/invoices"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to invoices
        </Link>
      </div>
      <InvoiceDetailComponent invoice={invoice} />
    </main>
  )
}
