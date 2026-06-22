'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { buildStoragePath, BUCKET } from '@/lib/storage'
import type { ActionState, AttachmentEntityType } from '@/types'

export async function uploadAttachment(
  entityType: AttachmentEntityType,
  entityId: string,
  boatId: string,
  returnUrl: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos para subir archivos' }
  if (membership.boat_id !== boatId) return { error: 'Acceso denegado' }

  const file = (formData.getAll('file') as File[]).find((f) => f.size > 0) ?? null
  if (!file) return { error: 'Selecciona un archivo' }
  if (file.size > 20 * 1024 * 1024) return { error: 'El archivo no puede superar 20 MB' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const path = buildStoragePath(boatId, entityType, entityId, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase.from('attachments').insert({
    boat_id: boatId,
    entity_type: entityType,
    entity_id: entityId,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    mime_type: file.type,
    created_by: user?.id ?? null,
  })

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([path])
    return { error: dbError.message }
  }

  revalidatePath(returnUrl)
  return { success: true }
}

export async function deleteAttachment(
  attachmentId: string,
  filePath: string,
  returnUrl: string,
) {
  const membership = await getBoatMembership()
  if (!membership || membership.role !== 'admin') return

  const supabase = await createClient()
  await supabase.storage.from(BUCKET).remove([filePath])
  await supabase.from('attachments').delete().eq('id', attachmentId)

  revalidatePath(returnUrl)
  redirect(returnUrl)
}
