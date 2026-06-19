'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { DOCUMENT_TYPES } from '@/lib/constants'
import type { ActionState, Document } from '@/types'

interface Props {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: Document
}

export function DocumentForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
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

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Archivo {item?.file_url ? '(reemplazar)' : ''}
        </label>
        <input
          type="file"
          name="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm hover:file:bg-slate-200 transition-colors"
        />
        {item?.file_url && (
          <p className="text-xs text-slate-400">Ya hay un archivo. Selecciona otro para reemplazarlo.</p>
        )}
      </div>

      <Textarea name="notes" label="Notas" defaultValue={item?.notes ?? ''} rows={2} />

      <Button type="submit" className="w-full" loading={pending}>
        {item ? 'Guardar cambios' : 'Crear documento'}
      </Button>
    </form>
  )
}
