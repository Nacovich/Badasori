'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionState } from '@/types'

interface Props {
  uploadAction: (_prev: ActionState, formData: FormData) => Promise<ActionState>
}

export function UploadForm({ uploadAction }: Props) {
  const [state, formAction, pending] = useActionState(uploadAction, {})
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) {
      router.refresh()
      if (galleryRef.current) galleryRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
    }
  }, [state.success, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) e.target.form?.requestSubmit()
  }

  const btnBase =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer select-none'

  return (
    <form action={formAction}>
      {/* Input galería */}
      <input
        ref={galleryRef}
        id="upload-gallery"
        type="file"
        name="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleChange}
        disabled={pending}
      />
      {/* Input cámara */}
      <input
        ref={cameraRef}
        id="upload-camera"
        type="file"
        name="file"
        className="hidden"
        accept="image/*"
        // @ts-expect-error — capture is valid HTML but missing from React types
        capture="environment"
        onChange={handleChange}
        disabled={pending}
      />

      <div className="flex gap-2 flex-wrap">
        {pending ? (
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

      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  )
}
