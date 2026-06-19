import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { FishingForm } from '@/components/modules/FishingForm'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateFishingLog, deleteFishingLog } from '../actions'
import { formatDate } from '@/lib/utils'
import type { FishingLog } from '@/types'

export default async function PescaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('fishing_logs')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as FishingLog
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateFishingLog.bind(null, id)
  const deleteAction = deleteFishingLog.bind(null, id)

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar captura' : 'Detalle captura'} backHref="/pesca" />

      {editor ? (
        <FishingForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Fecha', value: formatDate(item.date) },
            { label: 'Especie', value: item.species },
            { label: 'Zona', value: item.zone ?? '—' },
            { label: 'Profundidad', value: item.depth != null ? `${item.depth} m` : '—' },
            { label: 'Señuelo / Carnada', value: item.bait ?? '—' },
            { label: 'Cantidad', value: item.quantity != null ? String(item.quantity) : '—' },
            { label: 'Captura y suelta', value: item.catch_and_release ? 'Sí' : 'No' },
            { label: 'Observaciones', value: item.observations ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3 gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <AttachmentSection
        entityType="fishing_log"
        entityId={id}
        boatId={membership.boat_id}
        canEdit={editor}
        canDelete={admin}
        returnUrl={`/pesca/${id}`}
      />

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar este registro?"
          label="Eliminar registro"
        />
      )}
    </div>
  )
}
