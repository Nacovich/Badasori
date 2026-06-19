import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { ExpenseForm } from '@/components/modules/ExpenseForm'
import { createExpense } from '../actions'

export default async function NuevoGastoPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/gastos')

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo gasto" backHref="/gastos" />
      <ExpenseForm action={createExpense} />
    </div>
  )
}
