'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { TimeInput } from '@/components/ui/TimeInput'
import { WEATHER_OPTIONS } from '@/lib/constants'
import type { Trip, ActionState } from '@/types'

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  item?: Trip
}

export function TripForm({ action, item }: Props) {
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="departure_port"
          name="departure_port"
          label="Puerto de salida"
          required
          defaultValue={item?.departure_port ?? ''}
          placeholder="Origen"
        />
        <Input
          id="arrival_port"
          name="arrival_port"
          label="Puerto de llegada"
          defaultValue={item?.arrival_port ?? ''}
          placeholder="Destino"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TimeInput
          id="departure_time"
          name="departure_time"
          label="Hora salida"
          defaultValue={item?.departure_time ?? ''}
        />
        <TimeInput
          id="arrival_time"
          name="arrival_time"
          label="Hora llegada"
          defaultValue={item?.arrival_time ?? ''}
        />
      </div>

      <Input
        id="skipper"
        name="skipper"
        label="Patrón"
        defaultValue={item?.skipper ?? ''}
        placeholder="Nombre del patrón"
      />

      <Input
        id="crew"
        name="crew"
        label="Tripulación"
        defaultValue={item?.crew?.join(', ') ?? ''}
        placeholder="Juan, María, Pedro (separados por comas)"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="engine_hours_start"
          name="engine_hours_start"
          label="Horas motor inicio"
          type="number"
          min="0"
          step="0.1"
          defaultValue={item?.engine_hours_start?.toString() ?? ''}
          placeholder="0.0"
        />
        <Input
          id="engine_hours_end"
          name="engine_hours_end"
          label="Horas motor final"
          type="number"
          min="0"
          step="0.1"
          defaultValue={item?.engine_hours_end?.toString() ?? ''}
          placeholder="0.0"
        />
      </div>

      <Input
        id="estimated_miles"
        name="estimated_miles"
        label="Millas estimadas"
        type="number"
        min="0"
        step="0.1"
        defaultValue={item?.estimated_miles?.toString() ?? ''}
        placeholder="0.0"
      />

      <Select
        id="weather"
        name="weather"
        label="Meteorología"
        options={WEATHER_OPTIONS}
        defaultValue={item?.weather ?? ''}
      />

      <Textarea
        id="incidents"
        name="incidents"
        label="Incidencias"
        defaultValue={item?.incidents ?? ''}
        placeholder="Incidencias durante la salida..."
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        defaultValue={item?.notes ?? ''}
        placeholder="Notas adicionales..."
      />

      <Button type="submit" loading={pending} className="w-full">
        {item ? 'Guardar cambios' : 'Registrar salida'}
      </Button>
    </form>
  )
}
