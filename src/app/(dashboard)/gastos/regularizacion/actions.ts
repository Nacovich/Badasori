'use server'

import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { computeTransfers } from '@/lib/regularizacion'

export async function confirmRegularizacion(formData: FormData) {
  const year = parseInt(formData.get('year') as string)
  if (!year || isNaN(year)) return

  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return

  const supabase = await createClient()

  const { data: boatData } = await supabase
    .from('boats')
    .select('socios')
    .eq('id', membership.boat_id)
    .single()

  const socios: string[] = (boatData?.socios as string[] | null)?.filter(Boolean) ?? []
  if (socios.length < 2) redirect('/gastos')

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
  const average = total / socios.length

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
  if (transfers.length === 0) redirect(`/informes?year=${year}`)

  const today = new Date().toISOString().split('T')[0]
  await supabase.from('regularizaciones').insert(
    transfers.map((t) => ({
      boat_id: membership.boat_id,
      date: today,
      year,
      from_socio: t.from,
      to_socio: t.to,
      amount: t.amount,
    }))
  )

  revalidatePath('/gastos')
  revalidatePath('/informes')
  redirect(`/informes?year=${year}`)
}
