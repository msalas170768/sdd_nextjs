'use client'

import { useState, useTransition } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { invoiceSchema, type InvoiceFormValues } from '@/lib/validations/invoice'
import { createInvoice, updateInvoice } from '@/lib/actions/invoices'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CrudInvoiceProps {
  invoice?: {
    id: string
    amount: number
    currency: string
    status: 'PAID' | 'PENDING' | 'OVERDUE'
    dueDate: Date
    issuedAt: Date
    description: string | null
  }
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

function toDateDisplay(value: unknown): string {
  if (value instanceof Date) return toDateInputValue(value)
  if (typeof value === 'string') return value
  return ''
}

export default function CrudInvoice({ invoice }: CrudInvoiceProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: invoice
      ? {
          amount:      invoice.amount,
          currency:    invoice.currency,
          status:      invoice.status,
          dueDate:     invoice.dueDate,
          issuedAt:    invoice.issuedAt,
          description: invoice.description ?? '',
        }
      : {
          amount:      '' as unknown as number,
          currency:    'USD',
          status:      'PENDING' as const,
          dueDate:     '' as unknown as Date,
          issuedAt:    '' as unknown as Date,
          description: '',
        },
  })

  function onSubmit(data: InvoiceFormValues) {
    setError(null)
    startTransition(async () => {
      const result = invoice
        ? await updateInvoice(invoice.id, data)
        : await createInvoice(data)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" maxLength={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={toDateDisplay(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Issued At */}
        <FormField
          control={form.control}
          name="issuedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issued At</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={toDateDisplay(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Invoice description…" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Aceptar'}
          </Button>
          <Link
            href="/dashboard/invoices"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </Form>
  )
}
