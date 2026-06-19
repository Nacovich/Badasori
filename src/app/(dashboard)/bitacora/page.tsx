import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'
import type { Trip } from '@/types'

export default async function BitacoraPage({
  searchParams,
}: {
  searchParams: Promise<{ año?: string }>
}) {
  const { año } = await searchParams
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const currentYear = new Date().getFullYear()
  const selectedYear = año ? parseInt(año) : currentYear

  const startDate = `${selectedYear}-01-01`
  const endDate = `${selectedYear}-12-31`

  const { data } = await supabase
    .from('trips')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  const items = (data ?? []) as Trip[]
  const editor = membership.role !== 'viewer'

  const totalMiles = items.reduce((s, t) => s + (t.estimated_miles ?? 0), 0)
  const totalHours = items.reduce((s, t) => {
    if (t.engine_hours_start != null && t.engine_hours_end != null) {
      return s + (t.engine_hours_end - t.engine_hours_start)
    }
    return s
  }, 0)

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bitácora"
        action={
          editor ? (
            <Link
              href="/bitacora/nueva"
              className="flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </Link>
          ) : undefined
        }
      />

      {/* Filtro por año */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {years.map((y) => (
          <Link
            key={y}
            href={`/bitacora?año=${y}`}
            className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition-colors ${
              selectedYear === y ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {/* Resumen del año */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Salidas', value: String(items.length) },
            { label: 'Millas', value: totalMiles > 0 ? `${totalMiles.toFixed(1)} mn` : '—' },
            { label: 'Horas motor', value: totalHours > 0 ? `${totalHours.toFixed(1)} h` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={`Sin salidas en ${selectedYear}`}
          description={editor ? 'Pulsa "Nueva" para registrar la primera.' : undefined}
          icon={<BookOpen className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const hours =
              item.engine_hours_start != null && item.engine_hours_end != null
                ? (item.engine_hours_end - item.engine_hours_start).toFixed(1)
                : null

            return (
              <Link key={item.id} href={`/bitacora/${item.id}`}>
                <Card className="hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.departure_port}
                        {item.arrival_port != null ? ` → ${item.arrival_port}` : ''}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(item.date)}
                        {item.skipper != null ? ` · Patrón: ${item.skipper}` : ''}
                      </p>
                      {(hours != null || item.estimated_miles != null) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {hours != null ? `${hours} h motor` : ''}
                          {hours != null && item.estimated_miles != null ? ' · ' : ''}
                          {item.estimated_miles != null ? `${item.estimated_miles} mn` : ''}
                        </p>
                      )}
                    </div>
                    {item.weather != null && (
                      <span className="text-xl flex-shrink-0">
                        {item.weather === 'soleado' ? '☀️' :
                         item.weather === 'nublado' ? '⛅' :
                         item.weather === 'lluvia' ? '🌧' :
                         item.weather === 'viento_suave' ? '🌬' :
                         item.weather === 'viento_fuerte' ? '💨' :
                         item.weather === 'tormenta' ? '⛈' : ''}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
