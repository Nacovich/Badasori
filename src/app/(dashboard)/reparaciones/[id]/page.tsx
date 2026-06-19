import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { RepairForm } from '@/components/modules/RepairForm'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateRepair, deleteRepair } from '../actions'
import { REPAIR_STATUS_LABEL } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Repair } from '@/types'

export default async function ReparacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('repairs')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as Repair
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateRepair.bind(null, id)
  const deleteAction = deleteRepair.bind(null, id)

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar reparación' : 'Detalle reparación'} backHref="/reparaciones" />

      {editor ? (
        <RepairForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Título', value: item.title },
            { label: 'Descripción', value: item.description ?? '—' },
            { label: 'Fecha', value: formatDate(item.date) },
            { label: 'Proveedor', value: item.provider ?? '—' },
            { label: 'Coste', value: formatCurrency(item.cost) },
            { label: 'Estado', value: REPAIR_STATUS_LABEL[item.status] },
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
        entityType="repair"
        entityId={id}
        boatId={membership.boat_id}
        canEdit={editor}
        canDelete={admin}
        returnUrl={`/reparaciones/${id}`}
      />

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar esta reparación? Esta acción no se puede deshacer."
          label="Eliminar reparación"
        />
      )}
    </div>
  )
}
