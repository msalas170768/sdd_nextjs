import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getInvoices } from '@/lib/invoices'
import InvoiceTable from '@/components/invoices/InvoiceTable'

export default async function InvoicesPage() {
  const session = await auth()
  const invoices = await getInvoices(session!.user!.id!)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link
          href="/dashboard/create_invoice"
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Add Invoice
        </Link>
      </div>
      {invoices.length > 0 ? (
        <InvoiceTable invoices={invoices} />
      ) : (
        <p className="text-gray-500">No invoices found.</p>
      )}
    </main>
  )
}
