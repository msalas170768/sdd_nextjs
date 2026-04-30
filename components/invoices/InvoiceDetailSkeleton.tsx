export default function InvoiceDetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white animate-pulse">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
      </div>
      <dl className="divide-y divide-gray-200 px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-40 rounded bg-gray-200 sm:col-span-2 sm:mt-0" />
          </div>
        ))}
      </dl>
    </div>
  )
}
