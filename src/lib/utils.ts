import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatNumber(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—'
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
