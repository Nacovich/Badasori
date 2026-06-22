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
