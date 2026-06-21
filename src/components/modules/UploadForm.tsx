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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) {
      router.refresh()
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [state.success, router])

  function openGallery() {
    if (!inputRef.current) return
    inputRef.current.removeAttribute('capture')
    inputRef.current.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt'
    inputRef.current.click()
  }

  function openCamera() {
    if (!inputRef.current) return
    inputRef.current.setAttribute('capture', 'environment')
    inputRef.current.accept = 'image/*'
    inputRef.current.click()
  }

  const btnBase =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors'

  return (
    <form action={formAction}>
      <input
        ref={inputRef}
        type="file"
        name="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) e.target.form?.requestSubmit()
        }}
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
            <button
              type="button"
              onClick={openGallery}
              className={`${btnBase} bg-white border-slate-200 text-blue-600 hover:bg-blue-50 active:bg-blue-100`}
            >
              <span className="text-base">📎</span>
              Adjuntar
            </button>
            <button
              type="button"
              onClick={openCamera}
              className={`${btnBase} bg-white border-slate-200 text-green-600 hover:bg-green-50 active:bg-green-100`}
            >
              <span className="text-base">📷</span>
              Foto
            </button>
          </>
        )}
      </div>

      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  )
}
