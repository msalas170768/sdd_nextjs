import { auth } from '@/lib/auth'
import { getInvoices } from '@/lib/invoices'
import InvoiceTable from '@/components/invoices/InvoiceTable'

export default async function InvoicesPage() {
  const session = await auth()
  const invoices = await getInvoices(session!.user!.id!)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Invoices</h1>
      {invoices.length > 0 ? (
        <InvoiceTable invoices={invoices} />
      ) : (
        <p className="text-gray-500">No invoices found.</p>
      )}
    </main>
  )
}
