'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { FishingLog, ActionState } from '@/types'

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: FishingLog
}

export function FishingForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const [catchRelease, setCatchRelease] = useState(item?.catch_and_release ?? false)
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
        id="species"
        name="species"
        label="Especie"
        required
        defaultValue={item?.species ?? ''}
        placeholder="Ej: Dorada, Lubina, Bonito..."
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="zone"
          name="zone"
          label="Zona"
          defaultValue={item?.zone ?? ''}
          placeholder="Ej: Cabo de Gata"
        />
        <Input
          id="depth"
          name="depth"
          label="Profundidad (m)"
          type="number"
          min="0"
          step="0.5"
          defaultValue={item?.depth?.toString() ?? ''}
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="bait"
          name="bait"
          label="Señuelo / Carnada"
          defaultValue={item?.bait ?? ''}
          placeholder="Ej: Jigging, Vivo..."
        />
        <Input
          id="quantity"
          name="quantity"
          label="Cantidad"
          type="number"
          min="0"
          defaultValue={item?.quantity?.toString() ?? ''}
          placeholder="0"
        />
      </div>

      {/* Captura y suelta */}
      <input type="hidden" name="catch_and_release" value={catchRelease ? 'true' : 'false'} />
      <button
        type="button"
        onClick={() => setCatchRelease(!catchRelease)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
          catchRelease
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <span className="text-sm font-medium">Captura y suelta</span>
        <span className="text-lg">{catchRelease ? '✅' : '⭕'}</span>
      </button>

      <Textarea
        id="observations"
        name="observations"
        label="Observaciones"
        defaultValue={item?.observations ?? ''}
        placeholder="Condiciones, técnica, resultados..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Registrar captura'}
      </Button>
    </form>
  )
}
