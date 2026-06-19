import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { MAINTENANCE_STATUS_LABEL } from '@/lib/constants'
import { updateMaintenanceStatus } from './actions'
import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'
import type { MaintenanceItem } from '@/types'

export default async function MantenimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  let query = supabase
    .from('maintenance_items')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('due_date', { ascending: true })

  if (estado === 'historial') {
    query = query.eq('status', 'completed')
  } else {
    query = query.neq('status', 'completed')
  }

  const { data } = await query
  const items = (data ?? []) as MaintenanceItem[]
  const today = new Date().toISOString().split('T')[0]
  const editor = membership.role !== 'viewer'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mantenimiento"
        action={
          editor ? (
            <Link
              href="/mantenimiento/nueva"
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
          href="/mantenimiento"
          className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition-colors ${
            estado !== 'historial' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
          }`}
        >
          Activas
        </Link>
        <Link
          href="/mantenimiento?estado=historial"
          className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition-colors ${
            estado === 'historial' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
          }`}
        >
          Historial
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={estado === 'historial' ? 'Sin revisiones completadas' : 'Sin revisiones activas'}
          description={estado !== 'historial' ? 'Pulsa "Nueva" para crear la primera.' : undefined}
          icon={<Wrench className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isOverdue =
              item.due_date != null && item.due_date < today && item.status !== 'completed'
            const nextStatus = item.status === 'pending' ? 'in_progress' : 'completed'
            const nextLabel = item.status === 'pending' ? 'Iniciar' : 'Completar ✓'
            const statusAction = updateMaintenanceStatus.bind(null, item.id, nextStatus)

            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/mantenimiento/${item.id}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{item.category}</p>
                    {item.due_date != null && (
                      <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                        {isOverdue ? '⚠ Vencida: ' : '📅 '}{formatDate(item.due_date)}
                      </p>
                    )}
                  </Link>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'in_progress'
                          ? 'info'
                          : isOverdue
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {MAINTENANCE_STATUS_LABEL[item.status]}
                    </Badge>
                    {editor && item.status !== 'completed' && (
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
