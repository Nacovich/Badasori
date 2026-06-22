'use client'

import { useState, useTransition } from 'react'
import { updateBoatSocios } from '@/app/(dashboard)/barco/actions'
import { Users } from 'lucide-react'

const MAX_SOCIOS = 4

interface Props {
  initialSocios: string[]
  canEdit: boolean
}

export function SociosForm({ initialSocios, canEdit }: Props) {
  const [socios, setSocios] = useState<string[]>(() => {
    const base = [...initialSocios]
    while (base.length < MAX_SOCIOS) base.push('')
    return base
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(index: number, value: string) {
    setSaved(false)
    setSocios((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateBoatSocios(socios)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" />
        <h3 className="font-semibold text-slate-900 text-sm">Socios</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <p className="text-xs text-slate-400">
          Los gastos del informe financiero se reparten entre el número de socios activos.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {socios.map((socio, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Socio {i + 1}</label>
              <input
                type="text"
                value={socio}
                onChange={(e) => handleChange(i, e.target.value)}
                disabled={!canEdit}
                placeholder={canEdit ? `Nombre socio ${i + 1}` : '—'}
                maxLength={40}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {canEdit && (
          <div className="flex items-center justify-between pt-1">
            {saved && <span className="text-xs text-green-600">Guardado</span>}
            {!saved && <span />}
            <button
              type="submit"
              disabled={isPending}
              className="bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
            >
              {isPending ? 'Guardando…' : 'Guardar socios'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
