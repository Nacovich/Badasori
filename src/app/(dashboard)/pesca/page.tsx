import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { FishingLog } from '@/types'

export default async function PescaPage({
  searchParams,
}: {
  searchParams: Promise<{ especie?: string }>
}) {
  const { especie } = await searchParams
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()

  // Obtener especies únicas para el filtro
  const { data: allData } = await supabase
    .from('fishing_logs')
    .select('species')
    .eq('boat_id', membership.boat_id)
    .order('species')

  const species = [...new Set((allData ?? []).map((r: { species: string }) => r.species))].sort()

  let query = supabase
    .from('fishing_logs')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('date', { ascending: false })

  if (especie) query = query.eq('species', especie)

  const { data } = await query
  const items = (data ?? []) as FishingLog[]
  const editor = membership.role !== 'viewer'

  const totalCaptures = items.reduce((s, i) => s + (i.quantity ?? 0), 0)
  const released = items.filter((i) => i.catch_and_release).length

  return (
    <div className="space-y-4">
      <PageHeader
        title="Log de pesca"
        action={
          editor ? (
            <Link
              href="/pesca/nueva"
              className="flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </Link>
          ) : undefined
        }
      />

      {/* Filtro por especie */}
      {species.length > 1 && (
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1 w-max">
            <Link
              href="/pesca"
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !especie ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Todas
            </Link>
            {species.map((s) => (
              <Link
                key={s}
                href={`/pesca?especie=${encodeURIComponent(s)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  especie === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Resumen */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Salidas', value: String(items.length) },
            { label: 'Capturas', value: String(totalCaptures) },
            { label: 'Sueltas', value: String(released) },
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
          title="Sin registros de pesca"
          description={editor ? 'Pulsa "Nueva" para registrar la primera.' : undefined}
          icon={<span className="text-5xl">🎣</span>}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/pesca/${item.id}`}>
              <Card className="hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.species}</p>
                      {item.catch_and_release && (
                        <Badge variant="success">C&S</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(item.date)}
                      {item.zone != null ? ` · ${item.zone}` : ''}
                      {item.depth != null ? ` · ${item.depth} m` : ''}
                    </p>
                    {item.bait != null && (
                      <p className="text-xs text-slate-400">🎣 {item.bait}</p>
                    )}
                  </div>
                  {item.quantity != null && item.quantity > 0 && (
                    <span className="text-2xl font-bold text-slate-700 flex-shrink-0">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
