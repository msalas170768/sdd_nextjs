import type { InvoiceSummary } from '@/lib/invoices'
import InvoiceActionsCell from './InvoiceActionsCell'

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
      <td className="px-4 py-3 text-sm text-gray-900">
        {invoice.currency} {Number(invoice.amount).toFixed(2)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-50 truncate">
        {invoice.description ?? ''}
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
      <td className="px-4 py-3 text-sm text-gray-600">
        {invoice.userName ?? '—'}
      </td>
      <td className="px-4 py-3">
        <InvoiceActionsCell invoiceId={invoice.id} invoiceStatus={invoice.status} />
      </td>
    </tr>
  )
}
