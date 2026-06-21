'use server'

import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/types'

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim()
  return v || null
}

export async function createFuelLog(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const liters = parseFloat(formData.get('liters') as string)
  if (!liters || isNaN(liters)) return { error: 'Los litros son obligatorios' }
  const price = parseFloat(formData.get('price_per_liter') as string)
  if (!price || isNaN(price)) return { error: 'El precio por litro es obligatorio' }
  const total = parseFloat(formData.get('total_cost') as string) || liters * price

  const supabase = await createClient()
  const { error } = await supabase.from('fuel_logs').insert({
    boat_id: membership.boat_id,
    date,
    liters,
    price_per_liter: price,
    total_cost: parseFloat(total.toFixed(2)),
    engine_hours: formData.get('engine_hours') ? parseFloat(formData.get('engine_hours') as string) : null,
    location: str(formData, 'location'),
    paid_by: str(formData, 'paid_by'),
    notes: str(formData, 'notes'),
  })

  if (error) return { error: error.message }
  revalidatePath('/repostajes')
  redirect('/repostajes')
}

export async function updateFuelLog(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const liters = parseFloat(formData.get('liters') as string)
  if (!liters || isNaN(liters)) return { error: 'Los litros son obligatorios' }
  const price = parseFloat(formData.get('price_per_liter') as string)
  if (!price || isNaN(price)) return { error: 'El precio por litro es obligatorio' }
  const total = parseFloat(formData.get('total_cost') as string) || liters * price

  const supabase = await createClient()
  const { error } = await supabase
    .from('fuel_logs')
    .update({
      date,
      liters,
      price_per_liter: price,
      total_cost: parseFloat(total.toFixed(2)),
      engine_hours: formData.get('engine_hours') ? parseFloat(formData.get('engine_hours') as string) : null,
      location: str(formData, 'location'),
      paid_by: str(formData, 'paid_by'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/repostajes')
  redirect('/repostajes')
}

export async function deleteFuelLog(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase.from('fuel_logs').delete().eq('id', id).eq('boat_id', membership.boat_id)

  revalidatePath('/repostajes')
  redirect('/repostajes')
}
