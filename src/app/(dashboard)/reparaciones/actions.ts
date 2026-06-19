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

export async function createRepair(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const title = str(formData, 'title')
  if (!title) return { error: 'El título es obligatorio' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }

  const supabase = await createClient()
  const { error } = await supabase.from('repairs').insert({
    boat_id: membership.boat_id,
    title,
    description: str(formData, 'description'),
    date,
    provider: str(formData, 'provider'),
    cost: num(formData, 'cost'),
    status: 'pending',
    notes: str(formData, 'notes'),
  })

  if (error) return { error: error.message }
  revalidatePath('/reparaciones')
  redirect('/reparaciones')
}

export async function updateRepair(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const title = str(formData, 'title')
  if (!title) return { error: 'El título es obligatorio' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('repairs')
    .update({
      title,
      description: str(formData, 'description'),
      date,
      provider: str(formData, 'provider'),
      cost: num(formData, 'cost'),
      status: str(formData, 'status') ?? 'pending',
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/reparaciones')
  redirect('/reparaciones')
}

export async function updateRepairStatus(id: string, status: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return

  const supabase = await createClient()
  await supabase
    .from('repairs')
    .update({ status })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  revalidatePath('/reparaciones')
}

export async function deleteRepair(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase
    .from('repairs')
    .delete()
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  revalidatePath('/reparaciones')
  redirect('/reparaciones')
}
