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

export async function createExpense(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const concept = str(formData, 'concept')
  if (!concept) return { error: 'El concepto es obligatorio' }
  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const amount = parseFloat(formData.get('amount') as string)
  if (!amount || isNaN(amount)) return { error: 'El importe es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({
    boat_id: membership.boat_id,
    date,
    concept,
    category: str(formData, 'category') ?? 'otros',
    amount,
    provider: str(formData, 'provider'),
    notes: str(formData, 'notes'),
  })

  if (error) return { error: error.message }
  revalidatePath('/gastos')
  redirect('/gastos')
}

export async function updateExpense(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer')
    return { error: 'Sin permisos para realizar esta acción' }

  const concept = str(formData, 'concept')
  if (!concept) return { error: 'El concepto es obligatorio' }
  const date = str(formData, 'date')
  if (!date) return { error: 'La fecha es obligatoria' }
  const amount = parseFloat(formData.get('amount') as string)
  if (!amount || isNaN(amount)) return { error: 'El importe es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({
      date,
      concept,
      category: str(formData, 'category') ?? 'otros',
      amount,
      provider: str(formData, 'provider'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (error) return { error: error.message }
  revalidatePath('/gastos')
  redirect('/gastos')
}

export async function deleteExpense(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase.from('expenses').delete().eq('id', id).eq('boat_id', membership.boat_id)

  revalidatePath('/gastos')
  redirect('/gastos')
}
