'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { buildStoragePath, BUCKET } from '@/lib/storage'
import type { ActionState, AttachmentEntityType } from '@/types'

// Step 1: server generates a signed upload URL — no file data touches Vercel
export async function getSignedUploadUrl(
  entityType: AttachmentEntityType,
  entityId: string,
  boatId: string,
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos para subir archivos' }
  if (membership.boat_id !== boatId) return { error: 'Acceso denegado' }

  const supabase = await createClient()
  const path = buildStoragePath(boatId, entityType, entityId, fileName)

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return { error: error?.message ?? 'Error generando URL de subida' }

  return { path: data.path, token: data.token }
}

// Step 2: after the client uploads directly to Supabase, register the record in DB
export async function registerAttachment(
  entityType: AttachmentEntityType,
  entityId: string,
  boatId: string,
  returnUrl: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
): Promise<ActionState> {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') return { error: 'Sin permisos' }
  if (membership.boat_id !== boatId) return { error: 'Acceso denegado' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('attachments').insert({
    boat_id: boatId,
    entity_type: entityType,
    entity_id: entityId,
    file_name: fileName,
    file_path: filePath,
    file_size: fileSize,
    mime_type: mimeType,
    created_by: user?.id ?? null,
  })

  if (error) return { error: error.message }
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
