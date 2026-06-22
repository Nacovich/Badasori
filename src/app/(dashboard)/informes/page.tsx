import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORY_LABEL } from '@/lib/constants'
import Link from 'next/link'
import type { Expense } from '@/types'

export default async function InformesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear().toString()
  const year = yearParam ?? currentYear

  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()

  // Socios registrados en el barco
  const { data: boatData } = await supabase
    .from('boats')
    .select('socios')
    .eq('id', membership.boat_id)
    .single()

  const socios: string[] = (boatData?.socios as string[] | null)?.filter(Boolean) ?? []

  // Gastos del año seleccionado
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true })

  const expenses = (data ?? []) as Expense[]

  // Años disponibles
  const { data: allDates } = await supabase
    .from('expenses')
    .select('date')
    .eq('boat_id', membership.boat_id)

  const availableYears = [
    ...new Set((allDates ?? []).map((e) => (e.date as string).substring(0, 4))),
  ].sort().reverse()

  if (!availableYears.includes(year) && availableYears.length > 0) {
    availableYears.push(year)
  }

  // Cálculos totales
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const numSocios = socios.length || 1
  const average = total / numSocios

  const paidPerSocio: Record<string, number> = Object.fromEntries(socios.map((s) => [s, 0]))
  for (const e of expenses) {
    if (e.paid_by) {
      paidPerSocio[e.paid_by] = (paidPerSocio[e.paid_by] ?? 0) + e.amount
    }
  }

  // Agrupación por categoría
  type CatGroup = { total: number; perSocio: Record<string, number> }
  const grouped: Record<string, CatGroup> = {}
  for (const e of expenses) {
    if (!grouped[e.category]) grouped[e.category] = { total: 0, perSocio: {} }
    grouped[e.category].total += e.amount ?? 0
    if (e.paid_by) {
      grouped[e.category].perSocio[e.paid_by] =
        (grouped[e.category].perSocio[e.paid_by] ?? 0) + (e.amount ?? 0)
    }
  }
  const categories = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="space-y-4">
      <PageHeader title="Estado Financiero" />

      {/* Selector de año */}
      {availableYears.length > 0 && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {availableYears.map((y) => (
            <Link
              key={y}
              href={`/informes?year=${y}`}
              className={`flex-1 py-2 text-center text-sm rounded-lg font-medium whitespace-nowrap transition-colors min-w-[60px] ${
                y === year ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      )}

      {socios.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          Registra los socios en la sección <strong>Barco</strong> para que el reparto sea correcto.
        </div>
      )}

      {/* Resumen total */}
      <div className="bg-slate-900 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total {year}</span>
          <span className="text-white text-xl font-bold">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">
            Promedio x socio {numSocios > 1 ? `(entre ${numSocios})` : ''}
          </span>
          <span className="text-sky-400 font-semibold">{formatCurrency(average)}</span>
        </div>
      </div>

      {/* Balance por socio — sin scroll horizontal */}
      {socios.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Balance por socio</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Socio</th>
                <th className="text-right px-4 py-2 font-medium">Pagado</th>
                <th className="text-right px-4 py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {socios.map((socio) => {
                const paid = paidPerSocio[socio] ?? 0
                const balance = paid - average
                return (
                  <tr key={socio} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{socio}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(paid)}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {balance > 0 ? '+' : ''}{formatCurrency(balance)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalle agrupado por categoría */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No hay gastos registrados en {year}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Por categoría</h3>
            <span className="text-xs text-slate-400">{expenses.length} gastos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">Categoría</th>
                  <th className="text-right px-3 py-2 text-slate-500 font-medium whitespace-nowrap">Total</th>
                  {socios.map((s) => (
                    <th key={s} className="text-right px-3 py-2 text-slate-500 font-medium whitespace-nowrap">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(([cat, data]) => (
                  <tr key={cat} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-2.5 text-slate-900 font-medium whitespace-nowrap">
                      {EXPENSE_CATEGORY_LABEL[cat] ?? cat}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(data.total)}
                    </td>
                    {socios.map((s) => (
                      <td key={s} className={`px-3 py-2.5 text-right whitespace-nowrap ${
                        (data.perSocio[s] ?? 0) > 0 ? 'font-semibold text-slate-900' : 'text-slate-300'
                      }`}>
                        {(data.perSocio[s] ?? 0) > 0 ? formatCurrency(data.perSocio[s]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-3 py-2.5 font-bold text-slate-700">TOTAL</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(total)}
                  </td>
                  {socios.map((s) => (
                    <td key={s} className="px-3 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {(paidPerSocio[s] ?? 0) > 0 ? formatCurrency(paidPerSocio[s]) : '—'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
