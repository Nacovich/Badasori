'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import type { Expense, ActionState } from '@/types'

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: Expense
}

export function ExpenseForm({ action, item }: Props) {
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
        id="date"
        name="date"
        label="Fecha"
        type="date"
        required
        defaultValue={item?.date ?? today}
      />

      <Input
        id="concept"
        name="concept"
        label="Concepto"
        required
        defaultValue={item?.concept}
        placeholder="Ej: Amarre mensual"
      />

      <Select
        id="category"
        name="category"
        label="Categoría"
        required
        options={EXPENSE_CATEGORIES}
        defaultValue={item?.category ?? 'otros'}
      />

      <Input
        id="amount"
        name="amount"
        label="Importe (€)"
        type="number"
        min="0"
        step="0.01"
        required
        defaultValue={item?.amount?.toString() ?? ''}
        placeholder="0.00"
      />

      <Input
        id="provider"
        name="provider"
        label="Proveedor"
        defaultValue={item?.provider ?? ''}
        placeholder="Nombre del proveedor"
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        defaultValue={item?.notes ?? ''}
        placeholder="Notas adicionales..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Registrar gasto'}
      </Button>
    </form>
  )
}
