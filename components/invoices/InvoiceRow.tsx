import Link from 'next/link'
import type { InvoiceSummary } from '@/lib/invoices'

interface InvoiceRowProps {
  invoice: InvoiceSummary
}

const statusColors: Record<InvoiceSummary['status'], string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
}

export default function InvoiceRow({ invoice }: InvoiceRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-600">
        <Link
          href={`/dashboard/invoices/${invoice.id}`}
          className="text-blue-600 hover:underline"
        >
          {invoice.id.slice(0, 8)}…
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {invoice.currency} {Number(invoice.amount).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[invoice.status]}`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {new Date(invoice.dueDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {new Date(invoice.issuedAt).toLocaleDateString()}
      </td>
    </tr>
  )
}
