import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { ExpenseForm } from '@/components/modules/ExpenseForm'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateExpense, deleteExpense } from '../actions'
import { EXPENSE_CATEGORY_LABEL } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Expense } from '@/types'

export default async function GastoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as Expense
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateExpense.bind(null, id)
  const deleteAction = deleteExpense.bind(null, id)

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar gasto' : 'Detalle gasto'} backHref="/gastos" />

      {editor ? (
        <ExpenseForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Fecha', value: formatDate(item.date) },
            { label: 'Concepto', value: item.concept },
            { label: 'Categoría', value: EXPENSE_CATEGORY_LABEL[item.category] ?? item.category },
            { label: 'Importe', value: formatCurrency(item.amount) },
            { label: 'Proveedor', value: item.provider ?? '—' },
            { label: 'Notas', value: item.notes ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3 gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <AttachmentSection
        entityType="expense"
        entityId={id}
        boatId={membership.boat_id}
        canEdit={editor}
        canDelete={admin}
        returnUrl={`/gastos/${id}`}
      />

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar este gasto?"
          label="Eliminar gasto"
        />
      )}
    </div>
  )
}
