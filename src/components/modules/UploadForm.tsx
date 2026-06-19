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

  return (
    <form action={formAction}>
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          ref={inputRef}
          type="file"
          name="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(e) => {
            if (e.target.files?.length) e.target.form?.requestSubmit()
          }}
          disabled={pending}
        />
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
            pending
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50 active:bg-blue-100'
          }`}
        >
          {pending ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              Subiendo…
            </>
          ) : (
            <>
              <span className="text-base">📎</span>
              Añadir archivo
            </>
          )}
        </span>
      </label>

      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  )
}
