import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
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

  // Gastos del año seleccionado
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true })

  const expenses = (data ?? []) as Expense[]

  // Socios únicos de todos los gastos con paid_by (para columnas estables)
  const { data: allPaid } = await supabase
    .from('expenses')
    .select('paid_by')
    .eq('boat_id', membership.boat_id)
    .not('paid_by', 'is', null)

  const socios = [...new Set((allPaid ?? []).map((e) => e.paid_by as string))].sort()

  // Años disponibles para el selector
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

  // Cálculos
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const numSocios = socios.length || 1
  const average = total / numSocios

  const paidPerSocio: Record<string, number> = Object.fromEntries(socios.map((s) => [s, 0]))
  for (const e of expenses) {
    if (e.paid_by) paidPerSocio[e.paid_by] = (paidPerSocio[e.paid_by] ?? 0) + e.amount
  }

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

      {/* Resumen total */}
      <div className="bg-slate-900 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total {year}</span>
          <span className="text-white text-xl font-bold">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Promedio x socio ({numSocios})</span>
          <span className="text-sky-400 font-semibold">{formatCurrency(average)}</span>
        </div>
      </div>

      {/* Balance por socio */}
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
                <th className="text-right px-4 py-2 font-medium">Promedio</th>
                <th className="text-right px-4 py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {socios.map((socio) => {
                const paid = paidPerSocio[socio] ?? 0
                const balance = paid - average
                return (
                  <tr key={socio} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-900">{socio}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(paid)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(average)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {balance > 0 ? '+' : ''}{formatCurrency(balance)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalle de gastos */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No hay gastos registrados en {year}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">
              Detalle de gastos
              <span className="ml-1.5 text-slate-400 font-normal">({expenses.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap sticky left-0 bg-slate-50">Fecha</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">Concepto</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">Categoría</th>
                  <th className="text-right px-3 py-2 text-slate-500 font-medium whitespace-nowrap">Importe</th>
                  {socios.map((s) => (
                    <th key={s} className="text-right px-3 py-2 text-slate-500 font-medium whitespace-nowrap">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500 sticky left-0 bg-white">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-3 py-2 text-slate-900 max-w-[180px]">
                      <span className="block truncate">{expense.concept}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {EXPENSE_CATEGORY_LABEL[expense.category] ?? expense.category}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    {socios.map((s) => (
                      <td
                        key={s}
                        className={`px-3 py-2 text-right whitespace-nowrap ${
                          expense.paid_by === s
                            ? 'font-semibold text-slate-900'
                            : 'text-slate-300'
                        }`}
                      >
                        {expense.paid_by === s ? formatCurrency(expense.amount) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={3} className="px-3 py-2.5 font-bold text-slate-700 sticky left-0 bg-slate-50">
                    TOTAL
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                    {formatCurrency(total)}
                  </td>
                  {socios.map((s) => (
                    <td key={s} className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(paidPerSocio[s] ?? 0)}
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
