import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import CrudInvoice from '@/components/invoices/CrudInvoice'

export default async function CreateInvoicePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Invoice</h1>
      <CrudInvoice />
    </main>
  )
}
