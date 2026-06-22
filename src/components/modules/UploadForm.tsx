'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSignedUploadUrl, registerAttachment } from '@/lib/attachments'
import { BUCKET } from '@/lib/storage'
import type { AttachmentEntityType } from '@/types'

const MAX_SIZE = 20 * 1024 * 1024

interface Props {
  entityType: AttachmentEntityType
  entityId: string
  boatId: string
  returnUrl: string
}

export function UploadForm({ entityType, entityId, boatId, returnUrl }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE) {
      setError(`El archivo supera 20 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
      return
    }
    setUploading(true)
    setError(null)

    try {
      // 1. El servidor genera la URL firmada — el archivo NO pasa por Vercel
      const urlResult = await getSignedUploadUrl(entityType, entityId, boatId, file.name)
      if ('error' in urlResult) throw new Error(urlResult.error)

      // 2. El cliente sube directo a Supabase Storage
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(urlResult.path, urlResult.token, file, { contentType: file.type })
      if (uploadError) throw new Error(uploadError.message)

      // 3. El servidor registra el adjunto en la BD
      const regResult = await registerAttachment(
        entityType, entityId, boatId, returnUrl,
        file.name, urlResult.path, file.size, file.type,
      )
      if (regResult?.error) throw new Error(regResult.error)

      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
      if (galleryRef.current) galleryRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = Array.from(e.target.files ?? []).find((f) => f.size > 0)
    if (file) handleFile(file)
  }

  const btnBase =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer select-none'

  return (
    <div>
      <input
        ref={galleryRef}
        id="upload-gallery"
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleChange}
        disabled={uploading}
      />
      <input
        ref={cameraRef}
        id="upload-camera"
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        disabled={uploading}
      />

      <div className="flex gap-2 flex-wrap">
        {uploading ? (
          <span className={`${btnBase} bg-slate-50 border-slate-200 text-slate-400`}>
            <span className="animate-spin text-base">⏳</span>
            Subiendo…
          </span>
        ) : (
          <>
            <label
              htmlFor="upload-gallery"
              className={`${btnBase} bg-white border-slate-200 text-blue-600 hover:bg-blue-50 active:bg-blue-100`}
            >
              <span className="text-base">📎</span>
              Adjuntar
            </label>
            <label
              htmlFor="upload-camera"
              className={`${btnBase} bg-white border-slate-200 text-green-600 hover:bg-green-50 active:bg-green-100`}
            >
              <span className="text-base">📷</span>
              Foto
            </label>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
