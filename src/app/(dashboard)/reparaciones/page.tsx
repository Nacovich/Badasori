import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'
import { REPAIR_STATUS_LABEL } from '@/lib/constants'
import { updateRepairStatus } from './actions'
import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import type { Repair } from '@/types'

export default async function ReparacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  let query = supabase
    .from('repairs')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('date', { ascending: false })

  if (estado === 'historial') {
    query = query.eq('status', 'resolved')
  } else {
    query = query.neq('status', 'resolved')
  }

  const { data } = await query
  const items = (data ?? []) as Repair[]
  const editor = membership.role !== 'viewer'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reparaciones"
        action={
          editor ? (
            <Link
              href="/reparaciones/nueva"
              className="flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </Link>
          ) : undefined
        }
      />

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        <Link
          href="/reparaciones"
          className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition-colors ${
            estado !== 'historial' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
          }`}
        >
          Activas
        </Link>
        <Link
          href="/reparaciones?estado=historial"
          className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition-colors ${
            estado === 'historial' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
          }`}
        >
          Historial
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={estado === 'historial' ? 'Sin reparaciones resueltas' : 'Sin reparaciones activas'}
          description={estado !== 'historial' ? 'Pulsa "Nueva" para registrar la primera.' : undefined}
          icon={<AlertTriangle className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const nextStatus = item.status === 'pending' ? 'in_progress' : 'resolved'
            const nextLabel = item.status === 'pending' ? 'Iniciar' : 'Resolver ✓'
            const statusAction = updateRepairStatus.bind(null, item.id, nextStatus)

            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/reparaciones/${item.id}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
                    {item.provider != null && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.provider}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">📅 {formatDate(item.date)}</p>
                    {item.cost != null && (
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        {formatCurrency(item.cost)}
                      </p>
                    )}
                  </Link>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        item.status === 'resolved'
                          ? 'success'
                          : item.status === 'in_progress'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {REPAIR_STATUS_LABEL[item.status]}
                    </Badge>
                    {editor && item.status !== 'resolved' && (
                      <form action={statusAction}>
                        <button
                          type="submit"
                          className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                        >
                          {nextLabel}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
