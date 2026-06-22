'use server'

import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { revalidatePath } from 'next/cache'

export async function updateBoatSocios(socios: string[]) {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const clean = socios.map((s) => s.trim()).filter(Boolean)

  const supabase = await createClient()
  const { error } = await supabase
    .from('boats')
    .update({ socios: clean })
    .eq('id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/barco')
  revalidatePath('/informes')
  return { success: true }
}

export async function updateBoatData(formData: FormData) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin')
    return { error: 'Solo el administrador puede editar los datos del barco' }

  function str(key: string): string | null {
    const v = (formData.get(key) as string | null)?.trim()
    return v || null
  }
  function num(key: string): number | null {
    const v = parseFloat(formData.get(key) as string)
    return isNaN(v) ? null : v
  }

  const name = str('name')
  if (!name) return { error: 'El nombre del barco es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('boats')
    .update({
      name,
      registration: str('registration'),
      mmsi: str('mmsi'),
      length: num('length'),
      beam: num('beam'),
      home_port: str('home_port'),
      engine_hours: num('engine_hours'),
      observations: str('observations'),
    })
    .eq('id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/barco')
  return { success: true }
}
