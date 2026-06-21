import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { MaintenanceForm } from '@/components/modules/MaintenanceForm'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateMaintenanceItem, deleteMaintenanceItem } from '../actions'
import { MAINTENANCE_STATUS_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { MaintenanceItem } from '@/types'

export default async function MantenimientoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('maintenance_items')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as MaintenanceItem
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateMaintenanceItem.bind(null, id)
  const deleteAction = deleteMaintenanceItem.bind(null, id)

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar revisión' : 'Detalle revisión'} backHref="/mantenimiento" />

      {editor ? (
        <MaintenanceForm action={updateAction} item={item} />
      ) : (
        <div className="space-y-3 text-sm">
          <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
            {[
              { label: 'Título', value: item.title },
              { label: 'Categoría', value: item.category },
              { label: 'Estado', value: MAINTENANCE_STATUS_LABEL[item.status] },
              { label: 'Fecha prevista', value: formatDate(item.due_date) },
              { label: 'Periodicidad', value: item.periodicity ?? '—' },
              { label: 'Importe', value: item.cost != null ? `${item.cost.toFixed(2)} €` : '—' },
              { label: 'Notas', value: item.notes ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-4 py-3 gap-4">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar esta revisión? Esta acción no se puede deshacer."
          label="Eliminar revisión"
        />
      )}
    </div>
  )
}
