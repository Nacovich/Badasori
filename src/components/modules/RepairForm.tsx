'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Repair, ActionState } from '@/types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'resolved', label: 'Resuelto' },
]

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: Repair
}

export function RepairForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <Input
        id="title"
        name="title"
        label="Título"
        required
        defaultValue={item?.title}
        placeholder="Ej: Fallo en la bomba de achique"
      />

      <Textarea
        id="description"
        name="description"
        label="Descripción"
        defaultValue={item?.description ?? ''}
        placeholder="Describe la avería o reparación..."
      />

      <Input
        id="date"
        name="date"
        label="Fecha"
        type="date"
        required
        defaultValue={item?.date ?? today}
      />

      <Input
        id="provider"
        name="provider"
        label="Proveedor / Mecánico"
        defaultValue={item?.provider ?? ''}
        placeholder="Nombre del taller o mecánico"
      />

      <Input
        id="cost"
        name="cost"
        label="Coste (€)"
        type="number"
        min="0"
        step="0.01"
        defaultValue={item?.cost?.toString() ?? ''}
        placeholder="0.00"
      />

      {item && (
        <Select
          id="status"
          name="status"
          label="Estado"
          options={STATUS_OPTIONS}
          defaultValue={item.status}
        />
      )}

      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        defaultValue={item?.notes ?? ''}
        placeholder="Notas adicionales..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Registrar reparación'}
      </Button>
    </form>
  )
}
