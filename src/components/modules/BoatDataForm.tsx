'use client'

import { useState, useTransition } from 'react'
import { updateBoatData } from '@/app/(dashboard)/barco/actions'
import { Pencil, X, Check } from 'lucide-react'
import type { Boat } from '@/types'

interface Props {
  boat: Boat
  isAdmin: boolean
}

interface Field {
  key: keyof Boat
  label: string
  type: 'text' | 'number'
  step?: string
  unit?: string
}

const FIELDS: Field[] = [
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'brand', label: 'Marca', type: 'text' },
  { key: 'model', label: 'Modelo', type: 'text' },
  { key: 'build_year', label: 'Año de construcción', type: 'number', step: '1' },
  { key: 'registration', label: 'Matrícula', type: 'text' },
  { key: 'nib', label: 'N.I.B', type: 'text' },
  { key: 'mmsi', label: 'MMSI', type: 'text' },
  { key: 'hull_serial', label: 'N/S Casco', type: 'text' },
  { key: 'engine1_serial', label: 'N/S Motor 1', type: 'text' },
  { key: 'engine2_serial', label: 'N/S Motor 2', type: 'text' },
  { key: 'length', label: 'Eslora', type: 'number', step: '0.1', unit: 'm' },
  { key: 'beam', label: 'Manga', type: 'number', step: '0.1', unit: 'm' },
  { key: 'home_port', label: 'Puerto base', type: 'text' },
  { key: 'engine_hours', label: 'Horas de motor', type: 'number', step: '1', unit: 'h' },
  { key: 'observations', label: 'Observaciones', type: 'text' },
]

function displayValue(boat: Boat, field: Field): string {
  const v = boat[field.key]
  if (v == null || v === '') return '—'
  if (field.unit) return `${Number(v).toLocaleString('es-ES')} ${field.unit}`
  return String(v)
}

export function BoatDataForm({ boat, isAdmin }: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateBoatData(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setEditing(false)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">Datos del barco</h3>
        {isAdmin && !editing && (
          <button
            onClick={() => { setEditing(true); setSaved(false) }}
            className="flex items-center gap-1 text-xs text-sky-600 font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        )}
        {isAdmin && editing && (
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 text-xs text-slate-400 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
        )}
      </div>

      {!editing ? (
        <dl className="divide-y divide-slate-100 px-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex justify-between py-2.5 gap-4">
              <dt className="text-sm text-slate-500 flex-shrink-0">{field.label}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right">
                {displayValue(boat, field) === '—'
                  ? <span className="text-slate-300">—</span>
                  : displayValue(boat, field)}
              </dd>
            </div>
          ))}
          {saved && (
            <p className="py-2 text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Guardado correctamente
            </p>
          )}
        </dl>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label htmlFor={field.key} className="text-xs text-slate-500">
                {field.label}{field.unit ? ` (${field.unit})` : ''}
              </label>
              <input
                id={field.key}
                name={field.key}
                type={field.type}
                step={field.step}
                min={field.type === 'number' ? '0' : undefined}
                defaultValue={
                  boat[field.key] != null ? String(boat[field.key]) : ''
                }
                placeholder={field.label}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60"
          >
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  )
}
