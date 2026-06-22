'use client'

import { useActionState, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDocumentSignedUploadUrl } from '@/app/(dashboard)/documentos/actions'
import { BUCKET } from '@/lib/storage'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { DOCUMENT_TYPES } from '@/lib/constants'
import type { ActionState, Document } from '@/types'

const MAX_SIZE = 20 * 1024 * 1024

interface Props {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: Document
}

export function DocumentForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const [filePath, setFilePath] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size === 0) return

    if (file.size > MAX_SIZE) {
      setUploadError(`El archivo supera 20 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)
    setUploadError(null)
    setFilePath(null)

    try {
      const urlResult = await getDocumentSignedUploadUrl(file.name)
      if ('error' in urlResult) throw new Error(urlResult.error)

      const supabase = createClient()
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(urlResult.path, urlResult.token, file, { contentType: file.type })
      if (error) throw new Error(error.message)

      setFilePath(urlResult.path)
      setFileName(file.name)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir el archivo')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
      {/* file_path hidden — sent to server after direct upload */}
      <input type="hidden" name="file_path" value={filePath ?? ''} />

      {state.error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">{state.error}</div>
      )}

      <Select
        name="type"
        label="Tipo"
        defaultValue={item?.type ?? ''}
        required
        options={[{ value: '', label: 'Seleccionar tipo…' }, ...DOCUMENT_TYPES]}
      />

      <Input name="name" label="Nombre / descripción" defaultValue={item?.name ?? ''} required />

      <Input
        name="expiry_date"
        label="Fecha de vencimiento"
        type="date"
        defaultValue={item?.expiry_date ?? ''}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Archivo {item?.file_url ? '(reemplazar)' : ''}
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileChange}
          disabled={uploading || pending}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm hover:file:bg-slate-200 transition-colors"
        />
        {uploading && (
          <p className="text-xs text-slate-500">⏳ Subiendo archivo…</p>
        )}
        {filePath && !uploading && (
          <p className="text-xs text-green-600">✓ {fileName} listo para guardar</p>
        )}
        {uploadError && (
          <p className="text-xs text-red-600">{uploadError}</p>
        )}
        {item?.file_url && !filePath && (
          <p className="text-xs text-slate-400">Ya hay un archivo guardado. Selecciona otro para reemplazarlo.</p>
        )}
      </div>

      <Textarea name="notes" label="Notas" defaultValue={item?.notes ?? ''} rows={2} />

      <Button type="submit" className="w-full" loading={pending || uploading}>
        {item ? 'Guardar cambios' : 'Crear documento'}
      </Button>
    </form>
  )
}
