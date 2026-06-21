'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { FuelLog, ActionState } from '@/types'

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: FuelLog
}

export function FuelForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const today = new Date().toISOString().split('T')[0]

  const [liters, setLiters] = useState(item?.liters?.toString() ?? '')
  const [price, setPrice] = useState(item?.price_per_liter?.toString() ?? '')

  const l = parseFloat(liters)
  const p = parseFloat(price)
  const total = l > 0 && p > 0 ? l * p : item?.total_cost ?? 0

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
        id="liters"
        name="liters"
        label="Litros"
        type="number"
        min="0"
        step="0.01"
        required
        value={liters}
        onChange={(e) => setLiters(e.target.value)}
        placeholder="0.00"
      />

      <Input
        id="price_per_liter"
        name="price_per_liter"
        label="Precio por litro (€)"
        type="number"
        min="0"
        step="0.001"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="0.000"
      />

      {/* Total calculado automáticamente */}
      <input type="hidden" name="total_cost" value={total.toFixed(2)} />
      <div className="flex justify-between items-center bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
        <span className="text-sm font-medium text-slate-600">Total</span>
        <span className="text-lg font-bold text-sky-700">
          {total > 0 ? formatCurrency(total) : '—'}
        </span>
      </div>

      <Input
        id="engine_hours"
        name="engine_hours"
        label="Horas de motor"
        type="number"
        min="0"
        step="0.1"
        defaultValue={item?.engine_hours?.toString() ?? ''}
        placeholder="Ej: 1250.5"
      />

      <Input
        id="location"
        name="location"
        label="Puerto / Gasolinera"
        defaultValue={item?.location ?? ''}
        placeholder="Ej: Gasolinera del puerto"
      />

      <Input
        id="paid_by"
        name="paid_by"
        label="Pagado por"
        defaultValue={item?.paid_by ?? ''}
        placeholder="Nombre de quien paga"
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        defaultValue={item?.notes ?? ''}
        placeholder="Notas adicionales..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Registrar repostaje'}
      </Button>
    </form>
  )
}
