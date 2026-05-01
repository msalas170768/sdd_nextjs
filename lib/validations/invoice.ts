import { z } from 'zod'

export const invoiceSchema = z.object({
  amount:      z.coerce.number().positive('Amount must be positive'),
  currency:    z.string().min(1).max(3),
  status:      z.enum(['PAID', 'PENDING', 'OVERDUE']),
  dueDate:     z.coerce.date(),
  issuedAt:    z.coerce.date(),
  description: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
