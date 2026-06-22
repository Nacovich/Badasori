import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { computeTransfers } from '@/lib/regularizacion'
import { confirmRegularizacion } from './actions'

export default async function RegularizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year: yearParam } = await searchParams
  const year = parseInt(yearParam ?? String(new Date().getFullYear()))

  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return null

  const supabase = await createClient()

  const { data: boatData } = await supabase
    .from('boats')
    .select('socios')
    .eq('id', membership.boat_id)
    .single()

  const socios: string[] = (boatData?.socios as string[] | null)?.filter(Boolean) ?? []

  const [{ data: expData }, { data: regData }] = await Promise.all([
    supabase
      .from('expenses')
      .select('paid_by, amount')
      .eq('boat_id', membership.boat_id)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`),
    supabase
      .from('regularizaciones')
      .select('from_socio, to_socio, amount')
      .eq('boat_id', membership.boat_id)
      .eq('year', year),
  ])

  const total = (expData ?? []).reduce((s, e) => s + (e.amount as number), 0)
  const average = total / (socios.length || 1)

  const paid: Record<string, number> = Object.fromEntries(socios.map((s) => [s, 0]))
  for (const e of expData ?? []) {
    if (e.paid_by) paid[e.paid_by] = (paid[e.paid_by] ?? 0) + (e.amount as number)
  }

  const sent: Record<string, number> = Object.fromEntries(socios.map((s) => [s, 0]))
  const received: Record<string, number> = Object.fromEntries(socios.map((s) => [s, 0]))
  for (const r of regData ?? []) {
    sent[r.from_socio] = (sent[r.from_socio] ?? 0) + (r.amount as number)
    received[r.to_socio] = (received[r.to_socio] ?? 0) + (r.amount as number)
  }

  const balances: Record<string, number> = {}
  for (const s of socios) {
    balances[s] = (paid[s] ?? 0) - average + (sent[s] ?? 0) - (received[s] ?? 0)
  }

  const transfers = computeTransfers(balances)
  const isBalanced = transfers.length === 0

  return (
    <div className="space-y-4">
      <PageHeader title={`Regularización ${year}`} backHref="/gastos" />

      {socios.length < 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          Configura al menos 2 socios en la sección <strong>Barco</strong> antes de regularizar.
        </div>
      )}

      {/* Saldos actuales */}
      {socios.length >= 2 && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Saldo actual {year}</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {socios.map((s) => {
                  const b = balances[s] ?? 0
                  return (
                    <tr key={s} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{s}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${
                        b > 0.005 ? 'text-green-600' : b < -0.005 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {b > 0 ? '+' : ''}{formatCurrency(b)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {isBalanced ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 text-center font-medium">
              El saldo de {year} ya está equilibrado ✓
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm">Pagos para equilibrar</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {transfers.map((t, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-red-500">{t.from}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-green-600">{t.to}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form action={confirmRegularizacion}>
                <input type="hidden" name="year" value={String(year)} />
                <button
                  type="submit"
                  className="w-full bg-sky-500 text-white font-semibold py-3 rounded-2xl text-sm active:bg-sky-600"
                >
                  Confirmar regularización {year}
                </button>
              </form>

              <p className="text-xs text-slate-400 text-center">
                Se registrarán {transfers.length} pago{transfers.length !== 1 ? 's' : ''} y el saldo quedará a cero.
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
