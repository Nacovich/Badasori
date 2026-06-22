'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { buildStoragePath, BUCKET } from '@/lib/storage'
import type { ActionState } from '@/types'

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key)
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

// Returns a signed upload URL so the browser can upload directly to Supabase
export async function getDocumentSignedUploadUrl(
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos para subir archivos' }

  const supabase = await createClient()
  const path = buildStoragePath(membership.boat_id, 'documentos', Date.now().toString(), fileName)

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return { error: error?.message ?? 'Error generando URL de subida' }

  return { path: data.path, token: data.token }
}

export async function createDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos' }

  const name = str(formData, 'name')
  const type = str(formData, 'type')
  if (!name) return { error: 'El nombre es obligatorio' }
  if (!type) return { error: 'El tipo es obligatorio' }

  const filePath = str(formData, 'file_path')

  const supabase = await createClient()

  const { data: doc, error: dbErr } = await supabase
    .from('documents')
    .insert({
      boat_id: membership.boat_id,
      type,
      name,
      expiry_date: str(formData, 'expiry_date'),
      notes: str(formData, 'notes'),
      file_url: filePath ?? null,
    })
    .select('id')
    .single()

  if (dbErr || !doc) return { error: dbErr?.message ?? 'Error al crear documento' }

  revalidatePath('/documentos')
  redirect('/documentos')
}

export async function updateDocument(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos' }

  const name = str(formData, 'name')
  const type = str(formData, 'type')
  if (!name) return { error: 'El nombre es obligatorio' }
  if (!type) return { error: 'El tipo es obligatorio' }

  const filePath = str(formData, 'file_path')

  const supabase = await createClient()

  const update: Record<string, unknown> = {
    type,
    name,
    expiry_date: str(formData, 'expiry_date'),
    notes: str(formData, 'notes'),
  }
  if (filePath) update.file_url = filePath

  const { error: dbErr } = await supabase
    .from('documents')
    .update(update)
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (dbErr) return { error: dbErr.message }

  revalidatePath('/documentos')
  redirect(`/documentos/${id}`)
}

export async function deleteDocument(id: string) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()

  const { data } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', id)
    .single()

  if (data?.file_url) {
    await supabase.storage.from(BUCKET).remove([data.file_url])
  }

  await supabase.from('documents').delete().eq('id', id).eq('boat_id', membership.boat_id)

  revalidatePath('/documentos')
  redirect('/documentos')
}
