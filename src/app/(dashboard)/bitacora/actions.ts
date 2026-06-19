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

function num(fd: FormData, key: string): number | null {
  const v = fd.get(key) as string | null
  return v ? parseFloat(v) : null
}

function parseCrew(fd: FormData): string[] {
  const raw = str(fd, 'crew')
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export async function createTrip(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const departure_port = str(formData, 'departure_port')
  if (!departure_port) return { error: 'El puerto de salida es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase.from('trips').insert({
    boat_id: membership.boat_id,
    date,
    departure_port,
    arrival_port: str(formData, 'arrival_port'),
    skipper: str(formData, 'skipper'),
    crew: parseCrew(formData),
    departure_time: str(formData, 'departure_time'),
    arrival_time: str(formData, 'arrival_time'),
    engine_hours_start: num(formData, 'engine_hours_start'),
    engine_hours_end: num(formData, 'engine_hours_end'),
    estimated_miles: num(formData, 'estimated_miles'),
    weather: str(formData, 'weather'),
    incidents: str(formData, 'incidents'),
    notes: str(formData, 'notes'),
  })

  if (error) return { error: error.message }
  revalidatePath('/bitacora')
  redirect('/bitacora')
}

export async function updateTrip(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const departure_port = str(formData, 'departure_port')
  if (!departure_port) return { error: 'El puerto de salida es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('trips')
    .update({
      date,
      departure_port,
      arrival_port: str(formData, 'arrival_port'),
      skipper: str(formData, 'skipper'),
      crew: parseCrew(formData),
      departure_time: str(formData, 'departure_time'),
      arrival_time: str(formData, 'arrival_time'),
      engine_hours_start: num(formData, 'engine_hours_start'),
      engine_hours_end: num(formData, 'engine_hours_end'),
      estimated_miles: num(formData, 'estimated_miles'),
      weather: str(formData, 'weather'),
      incidents: str(formData, 'incidents'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/bitacora')
  redirect('/bitacora')
}

export async function deleteTrip(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase.from('trips').delete().eq('id', id).eq('boat_id', membership.boat_id)

  revalidatePath('/bitacora')
  redirect('/bitacora')
}
