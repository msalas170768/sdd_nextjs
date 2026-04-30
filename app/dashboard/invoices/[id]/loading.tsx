import InvoiceDetailSkeleton from '@/components/invoices/InvoiceDetailSkeleton'

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 h-4 w-32 rounded bg-gray-200 animate-pulse" />
      <InvoiceDetailSkeleton />
    </main>
  )
}
