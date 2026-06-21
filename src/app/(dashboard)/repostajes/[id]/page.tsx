import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { FuelForm } from '@/components/modules/FuelForm'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { updateFuelLog, deleteFuelLog } from '../actions'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import type { FuelLog } from '@/types'

export default async function RepostajeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('fuel_logs')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as FuelLog
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateFuelLog.bind(null, id)
  const deleteAction = deleteFuelLog.bind(null, id)

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar repostaje' : 'Detalle repostaje'} backHref="/repostajes" />

      {editor ? (
        <FuelForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Fecha', value: formatDate(item.date) },
            { label: 'Litros', value: `${formatNumber(item.liters, 2)} L` },
            { label: 'Precio/litro', value: `${formatNumber(item.price_per_liter, 3)} €/L` },
            { label: 'Total', value: formatCurrency(item.total_cost) },
            { label: 'Horas motor', value: item.engine_hours != null ? `${item.engine_hours} h` : '—' },
            { label: 'Lugar', value: item.location ?? '—' },
            { label: 'Pagado por', value: item.paid_by ?? '—' },
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
        entityType="fuel_log"
        entityId={id}
        boatId={membership.boat_id}
        canEdit={editor}
        canDelete={admin}
        returnUrl={`/repostajes/${id}`}
      />

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar este repostaje?"
          label="Eliminar repostaje"
        />
      )}
    </div>
  )
}
