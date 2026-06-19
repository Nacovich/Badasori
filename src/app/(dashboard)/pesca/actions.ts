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

export async function createFishingLog(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const species = str(formData, 'species')
  if (!species) return { error: 'La especie es obligatoria' }

  const supabase = await createClient()
  const { error } = await supabase.from('fishing_logs').insert({
    boat_id: membership.boat_id,
    date,
    species,
    zone: str(formData, 'zone'),
    depth: formData.get('depth') ? parseFloat(formData.get('depth') as string) : null,
    bait: str(formData, 'bait'),
    quantity: formData.get('quantity') ? parseInt(formData.get('quantity') as string) : null,
    catch_and_release: formData.get('catch_and_release') === 'true',
    observations: str(formData, 'observations'),
  })

  if (error) return { error: error.message }
  revalidatePath('/pesca')
  redirect('/pesca')
}

export async function updateFishingLog(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const species = str(formData, 'species')
  if (!species) return { error: 'La especie es obligatoria' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('fishing_logs')
    .update({
      date,
      species,
      zone: str(formData, 'zone'),
      depth: formData.get('depth') ? parseFloat(formData.get('depth') as string) : null,
      bait: str(formData, 'bait'),
      quantity: formData.get('quantity') ? parseInt(formData.get('quantity') as string) : null,
      catch_and_release: formData.get('catch_and_release') === 'true',
      observations: str(formData, 'observations'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/pesca')
  redirect('/pesca')
}

export async function deleteFishingLog(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase.from('fishing_logs').delete().eq('id', id).eq('boat_id', membership.boat_id)

  revalidatePath('/pesca')
  redirect('/pesca')
}
