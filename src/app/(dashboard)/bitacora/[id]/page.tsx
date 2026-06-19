import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { TripForm } from '@/components/modules/TripForm'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateTrip, deleteTrip } from '../actions'
import { WEATHER_OPTIONS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Trip } from '@/types'

export default async function BitacoraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as Trip
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateTrip.bind(null, id)
  const deleteAction = deleteTrip.bind(null, id)

  const weatherLabel = WEATHER_OPTIONS.find((w) => w.value === item.weather)?.label ?? item.weather ?? '—'
  const engineHours =
    item.engine_hours_start != null && item.engine_hours_end != null
      ? `${item.engine_hours_start} → ${item.engine_hours_end} (${(item.engine_hours_end - item.engine_hours_start).toFixed(1)} h)`
      : item.engine_hours_start != null
      ? `Inicio: ${item.engine_hours_start}`
      : '—'

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar salida' : 'Detalle salida'} backHref="/bitacora" />

      {editor ? (
        <TripForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Fecha', value: formatDate(item.date) },
            { label: 'Ruta', value: item.arrival_port ? `${item.departure_port} → ${item.arrival_port}` : item.departure_port },
            { label: 'Patrón', value: item.skipper ?? '—' },
            { label: 'Tripulación', value: item.crew?.join(', ') || '—' },
            { label: 'Hora salida', value: item.departure_time ?? '—' },
            { label: 'Hora llegada', value: item.arrival_time ?? '—' },
            { label: 'Horas motor', value: engineHours },
            { label: 'Millas', value: item.estimated_miles != null ? `${item.estimated_miles} mn` : '—' },
            { label: 'Meteorología', value: weatherLabel },
            { label: 'Incidencias', value: item.incidents ?? '—' },
            { label: 'Notas', value: item.notes ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3 gap-4">
              <dt className="text-slate-500 flex-shrink-0">{label}</dt>
              <dd className="font-medium text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <AttachmentSection
        entityType="trip"
        entityId={id}
        boatId={membership.boat_id}
        canEdit={editor}
        canDelete={admin}
        returnUrl={`/bitacora/${id}`}
      />

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar esta salida?"
          label="Eliminar salida"
        />
      )}
    </div>
  )
}
