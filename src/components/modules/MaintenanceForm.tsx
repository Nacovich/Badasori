'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PERIODICITIES } from '@/lib/constants'
import type { MaintenanceItem, ActionState } from '@/types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Completado' },
]

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: MaintenanceItem
}

export function MaintenanceForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

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
        placeholder="Ej: Cambio de aceite motor"
      />

      <Select
        id="category"
        name="category"
        label="Categoría"
        options={MAINTENANCE_CATEGORIES}
        defaultValue={item?.category ?? 'otros'}
      />

      <Input
        id="due_date"
        name="due_date"
        label="Fecha prevista"
        type="date"
        defaultValue={item?.due_date ?? ''}
      />

      <Input
        id="due_engine_hours"
        name="due_engine_hours"
        label="Horas de motor previstas"
        type="number"
        min="0"
        step="0.1"
        defaultValue={item?.due_engine_hours?.toString() ?? ''}
        placeholder="Ej: 1500"
      />

      <Select
        id="periodicity"
        name="periodicity"
        label="Periodicidad"
        options={MAINTENANCE_PERIODICITIES}
        defaultValue={item?.periodicity ?? ''}
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

      <Input
        id="cost"
        name="cost"
        label="Importe (€)"
        type="number"
        min="0"
        step="0.01"
        defaultValue={item?.cost?.toString() ?? ''}
        placeholder="0.00"
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        defaultValue={item?.notes ?? ''}
        placeholder="Notas adicionales..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Crear revisión'}
      </Button>
    </form>
  )
}
