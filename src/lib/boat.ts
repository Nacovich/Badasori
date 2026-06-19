import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export interface BoatMembership {
  boat_id: string
  role: UserRole
}

export async function getBoatMembership(): Promise<BoatMembership | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('boat_members')
    .select('boat_id, role')
    .eq('user_id', user.id)
    .single()

  return data as BoatMembership | null
}

export function canEdit(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}
