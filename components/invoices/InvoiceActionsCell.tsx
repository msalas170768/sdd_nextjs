'use client'

import 'sweetalert2/dist/sweetalert2.min.css'
import { useTransition } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteInvoice } from '@/lib/actions/invoices'

interface InvoiceActionsCellProps {
  invoiceId: string
  invoiceStatus: 'PAID' | 'PENDING' | 'OVERDUE'
}

export default function InvoiceActionsCell({
  invoiceId,
  invoiceStatus,
}: InvoiceActionsCellProps) {
  const [isPending, startTransition] = useTransition()
  const canDelete = invoiceStatus === 'PENDING'

  async function handleDelete() {
    const Swal = (await import('sweetalert2')).default
    const result = await Swal.fire({
      title: '¿Eliminar factura?',
      text:  'Esta acción no se puede deshacer.',
      icon:  'warning',
      showCancelButton:    true,
      confirmButtonText:   'Eliminar',
      cancelButtonText:    'Cancelar',
      confirmButtonColor:  '#dc2626',
    })

    if (!result.isConfirmed) return

    startTransition(async () => {
      const res = await deleteInvoice(invoiceId)
      if (res?.error) {
        const Swal2 = (await import('sweetalert2')).default
        await Swal2.fire({ title: 'Error', text: res.error, icon: 'error' })
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/invoices/${invoiceId}`}
        aria-label="View"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
      >
        <Eye className="size-4" />
      </Link>

      <Link
        href={`/dashboard/update_invoice/${invoiceId}`}
        aria-label="Edit"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
      >
        <Pencil className="size-4" />
      </Link>

      <Button
        variant="ghost"
        size="icon"
        disabled={!canDelete || isPending}
        aria-disabled={!canDelete}
        aria-label="Delete"
        onClick={canDelete ? handleDelete : undefined}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
