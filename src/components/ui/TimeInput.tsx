'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  label?: string
  defaultValue?: string
  id?: string
  className?: string
}

export function TimeInput({ name, label, defaultValue = '', id, className }: Props) {
  const [value, setValue] = useState(defaultValue)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Keep only digits, max 4
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    // Insert colon after 2 digits
    setValue(digits.length >= 3 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits)
  }

  function handleBlur() {
    const match = value.match(/^(\d{1,2}):?(\d{0,2})$/)
    if (!match) { setValue(''); return }
    const h = parseInt(match[1] ?? '0', 10)
    const m = parseInt(match[2] || '0', 10)
    if (h > 23 || m > 59) { setValue(''); return }
    setValue(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        maxLength={5}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete="off"
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-base placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
          className
        )}
      />
    </div>
  )
}
