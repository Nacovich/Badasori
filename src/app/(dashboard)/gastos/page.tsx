import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL } from '@/lib/constants'
import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import type { Expense } from '@/types'

const CAT_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  mantenimiento: 'info',
  reparacion: 'danger',
  pesca: 'success',
  seguridad: 'warning',
  equipamiento: 'info',
  marina: 'default',
  otros: 'default',
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('date', { ascending: false })

  if (cat && cat !== 'todas') query = query.eq('category', cat)

  const { data } = await query
  const items = (data ?? []) as Expense[]

  const total = items.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const editor = membership.role !== 'viewer'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gastos y compras"
        action={
          editor ? (
            <div className="flex gap-2">
              <Link
                href="/gastos/nueva"
                className="flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </Link>
              <Link
                href={`/gastos/regularizacion?year=${new Date().getFullYear()}`}
                className="flex items-center gap-1 bg-slate-700 text-white text-sm font-semibold px-3 py-2 rounded-xl whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Regulariz.
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Filtro por categoría — dos líneas, sin scroll */}
      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/gastos"
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            !cat || cat === 'todas'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas
        </Link>
        {EXPENSE_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/gastos?cat=${c.value}`}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              cat === c.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.shortLabel}
          </Link>
        ))}
      </div>

      {/* Resumen total */}
      {items.length > 0 && (
        <div className="bg-slate-900 rounded-2xl px-5 py-4 flex justify-between items-center">
          <span className="text-slate-400 text-sm">
            {cat && cat !== 'todas' ? EXPENSE_CATEGORY_LABEL[cat] : 'Total'} ({items.length})
          </span>
          <span className="text-white text-xl font-bold">{formatCurrency(total)}</span>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Sin gastos registrados"
          description={editor ? 'Pulsa "Nuevo" para registrar el primero.' : undefined}
          icon={<Receipt className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/gastos/${item.id}`}>
              <Card className="hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.concept}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={CAT_COLORS[item.category] ?? 'default'}>
                        {EXPENSE_CATEGORY_LABEL[item.category] ?? item.category}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                    </div>
                    {(item.provider != null || item.paid_by != null) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.provider}
                        {item.provider != null && item.paid_by != null && ' · '}
                        {item.paid_by != null && `Paga: ${item.paid_by}`}
                      </p>
                    )}
                  </div>
                  <span className="text-base font-bold text-slate-800 flex-shrink-0">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
