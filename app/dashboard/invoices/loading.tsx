import InvoiceListSkeleton from '@/components/invoices/InvoiceListSkeleton'

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 h-8 w-32 rounded bg-gray-200 animate-pulse" />
      <InvoiceListSkeleton />
    </main>
  )
}
