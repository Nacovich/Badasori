'use server'

import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/types'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key) as string | null
  return v ? Number(v) : null
}

export async function createMaintenanceItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const title = str(formData, 'title')
  if (!title) return { error: 'El título es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase.from('maintenance_items').insert({
    boat_id: membership.boat_id,
    title,
    category: str(formData, 'category') ?? 'otros',
    due_date: str(formData, 'due_date'),
    due_engine_hours: num(formData, 'due_engine_hours'),
    periodicity: str(formData, 'periodicity'),
    status: 'pending',
    notes: str(formData, 'notes'),
  })

  if (error) return { error: error.message }
  revalidatePath('/mantenimiento')
  redirect('/mantenimiento')
}

export async function updateMaintenanceItem(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const title = str(formData, 'title')
  if (!title) return { error: 'El título es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('maintenance_items')
    .update({
      title,
      category: str(formData, 'category') ?? 'otros',
      due_date: str(formData, 'due_date'),
      due_engine_hours: num(formData, 'due_engine_hours'),
      periodicity: str(formData, 'periodicity'),
      status: str(formData, 'status') ?? 'pending',
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/mantenimiento')
  redirect('/mantenimiento')
}

export async function updateMaintenanceStatus(id: string, status: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return

  const supabase = await createClient()
  await supabase
    .from('maintenance_items')
    .update({ status })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  revalidatePath('/mantenimiento')
}

export async function deleteMaintenanceItem(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase
    .from('maintenance_items')
    .delete()
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  revalidatePath('/mantenimiento')
  redirect('/mantenimiento')
}
