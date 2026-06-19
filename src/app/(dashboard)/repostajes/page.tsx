import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Fuel } from 'lucide-react'
import type { FuelLog } from '@/types'

export default async function RepostajesPage() {
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('fuel_logs')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('date', { ascending: false })

  const items = (data ?? []) as FuelLog[]
  const editor = membership.role !== 'viewer'

  const totalLiters = items.reduce((s, i) => s + (i.liters ?? 0), 0)
  const totalCost = items.reduce((s, i) => s + (i.total_cost ?? 0), 0)
  const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="Repostajes"
        action={
          editor ? (
            <Link
              href="/repostajes/nuevo"
              className="flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Link>
          ) : undefined
        }
      />

      {/* Resumen */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total litros', value: `${formatNumber(totalLiters, 0)} L` },
            { label: 'Total gasto', value: formatCurrency(totalCost) },
            { label: 'Precio medio', value: `${formatNumber(avgPrice, 3)} €/L` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
              <p className="text-xs text-slate-400 leading-tight">{label}</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Sin repostajes registrados"
          description={editor ? 'Pulsa "Nuevo" para registrar el primero.' : undefined}
          icon={<Fuel className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/repostajes/${item.id}`}>
              <Card className="hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {formatNumber(item.liters, 0)} L · {formatNumber(item.price_per_liter, 3)} €/L
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(item.date)}
                      {item.location != null ? ` · ${item.location}` : ''}
                      {item.engine_hours != null ? ` · ${item.engine_hours} h` : ''}
                    </p>
                  </div>
                  <span className="text-base font-bold text-sky-700">
                    {formatCurrency(item.total_cost)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
