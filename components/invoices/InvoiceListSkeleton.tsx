export default function InvoiceListSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['ID', 'Amount', 'Status', 'Due Date', 'Issued'].map((col) => (
              <th key={col} className="px-4 py-3 text-left">
                <div className="h-3 w-16 rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <div className="h-4 w-20 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 rounded bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
