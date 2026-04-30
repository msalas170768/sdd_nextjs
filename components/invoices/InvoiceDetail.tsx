import type { InvoiceDetail as InvoiceDetailType } from '@/lib/invoices'

interface InvoiceDetailProps {
  invoice: InvoiceDetailType
}

const statusColors: Record<InvoiceDetailType['status'], string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  )
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Invoice <span className="font-mono text-gray-500">{invoice.id.slice(0, 8)}…</span>
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[invoice.status]}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>
      <dl className="divide-y divide-gray-200 px-6">
        <Field label="Amount" value={`${invoice.currency} ${Number(invoice.amount).toFixed(2)}`} />
        <Field label="Currency" value={invoice.currency} />
        <Field label="Due Date" value={new Date(invoice.dueDate).toLocaleDateString()} />
        <Field label="Issued At" value={new Date(invoice.issuedAt).toLocaleDateString()} />
        {invoice.description && (
          <Field label="Description" value={invoice.description} />
        )}
        <Field label="Created" value={new Date(invoice.createdAt).toLocaleString()} />
        <Field label="Last Updated" value={new Date(invoice.updatedAt).toLocaleString()} />
      </dl>
    </div>
  )
}
