import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatNumber } from '@/lib/utils'
import { Anchor } from 'lucide-react'

export default async function BoatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('boat_members')
    .select('boat_id, role, boats(*)')
    .eq('user_id', user.id)
    .single()

  const boat = membership?.boats as unknown as Record<string, unknown> | null

  if (!boat) {
    return (
      <EmptyState
        title="Sin barco asignado"
        description="Contacta con el administrador."
        icon={<Anchor className="w-12 h-12" />}
      />
    )
  }

  const fields: { label: string; value: string | null }[] = [
    { label: 'Nombre', value: String(boat.name) },
    { label: 'Matrícula', value: boat.registration ? String(boat.registration) : null },
    { label: 'MMSI', value: boat.mmsi ? String(boat.mmsi) : null },
    { label: 'Eslora', value: boat.length ? `${formatNumber(Number(boat.length))} m` : null },
    { label: 'Manga', value: boat.beam ? `${formatNumber(Number(boat.beam))} m` : null },
    { label: 'Puerto base', value: boat.home_port ? String(boat.home_port) : null },
    { label: 'Horas de motor', value: boat.engine_hours != null ? `${Number(boat.engine_hours).toLocaleString('es-ES')} h` : null },
    { label: 'Observaciones', value: boat.observations ? String(boat.observations) : null },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-sky-500 rounded-xl p-2.5">
          <Anchor className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{String(boat.name)}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del barco</CardTitle>
        </CardHeader>
        <dl className="divide-y divide-slate-100">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 gap-4">
              <dt className="text-sm text-slate-500 flex-shrink-0">{label}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right">
                {value ?? <span className="text-slate-300">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <p className="text-xs text-slate-400 text-center">
        Rol en este barco: <strong className="text-slate-600">{membership?.role}</strong>
      </p>
    </div>
  )
}
