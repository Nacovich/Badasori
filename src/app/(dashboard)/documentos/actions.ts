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

async function handleFileUpload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  boatId: string,
  docId: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.size > 10 * 1024 * 1024) return null

  const path = buildStoragePath(boatId, 'documentos', docId, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  return error ? null : path
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

  const supabase = await createClient()

  const { data: doc, error: dbErr } = await supabase
    .from('documents')
    .insert({
      boat_id: membership.boat_id,
      type,
      name,
      expiry_date: str(formData, 'expiry_date'),
      notes: str(formData, 'notes'),
    })
    .select('id')
    .single()

  if (dbErr || !doc) return { error: dbErr?.message ?? 'Error al crear documento' }

  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    const path = await handleFileUpload(supabase, file, membership.boat_id, doc.id)
    if (path) {
      await supabase.from('documents').update({ file_url: path }).eq('id', doc.id)
    }
  }

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

  const supabase = await createClient()

  const { error: dbErr } = await supabase
    .from('documents')
    .update({
      type,
      name,
      expiry_date: str(formData, 'expiry_date'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id)
    .eq('boat_id', membership.boat_id)

  if (dbErr) return { error: dbErr.message }

  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    const path = await handleFileUpload(supabase, file, membership.boat_id, id)
    if (path) {
      await supabase.from('documents').update({ file_url: path }).eq('id', id)
    }
  }

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
