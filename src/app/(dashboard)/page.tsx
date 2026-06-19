import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Anchor,
  Wrench,
  AlertTriangle,
  Receipt,
  Fuel,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import type { MaintenanceItem, Repair, Expense, Trip } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('boat_members')
    .select('boat_id, role, boats(*)')
    .eq('user_id', user.id)
    .single()

  const boat = membership?.boats as unknown as Record<string, unknown> | null
  const boatId = membership?.boat_id

  const empty = { data: null }

  const [maintenanceRes, repairsRes, expensesRes, tripsRes] = await Promise.all([
    boatId
      ? supabase.from('maintenance_items').select('*').eq('boat_id', boatId).neq('status', 'completed').order('due_date', { ascending: true }).limit(3)
      : empty,
    boatId
      ? supabase.from('repairs').select('*').eq('boat_id', boatId).order('created_at', { ascending: false }).limit(3)
      : empty,
    boatId
      ? supabase.from('expenses').select('*').eq('boat_id', boatId).order('date', { ascending: false }).limit(3)
      : empty,
    boatId
      ? supabase.from('trips').select('*').eq('boat_id', boatId).order('date', { ascending: false }).limit(3)
      : empty,
  ])

  const maintenance = (maintenanceRes.data ?? []) as MaintenanceItem[]
  const repairs = (repairsRes.data ?? []) as Repair[]
  const expenses = (expensesRes.data ?? []) as Expense[]
  const trips = (tripsRes.data ?? []) as Trip[]

  if (!boat) {
    return (
      <div className="py-12">
        <EmptyState
          title="Sin barco asignado"
          description="Contacta con el administrador para que te añada a un barco."
          icon={<Anchor className="w-12 h-12" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabecera barco */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 rounded-xl p-2.5">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{String(boat.name)}</h2>
            <p className="text-slate-400 text-sm">
              {boat.registration ? String(boat.registration) : 'Sin matrícula'} ·{' '}
              {boat.home_port ? String(boat.home_port) : 'Sin puerto base'}
            </p>
          </div>
        </div>
        {boat.engine_hours != null && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Horas de motor</p>
            <p className="text-2xl font-bold text-sky-400">
              {Number(boat.engine_hours).toLocaleString('es-ES')} h
            </p>
          </div>
        )}
      </div>

      {/* Próximas revisiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            <CardTitle>Próximas revisiones</CardTitle>
          </div>
          <Link href="/mantenimiento" className="text-xs text-sky-600 font-medium">
            Ver todo
          </Link>
        </CardHeader>
        {maintenance.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Sin revisiones pendientes</p>
        ) : (
          <ul className="space-y-2">
            {maintenance.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  {item.due_date != null && (
                    <p className="text-xs text-slate-400">{formatDate(item.due_date)}</p>
                  )}
                </div>
                <Badge variant={item.status === 'in_progress' ? 'warning' : 'default'}>
                  {item.status === 'pending' ? 'Pendiente' : 'En curso'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Últimas reparaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <CardTitle>Reparaciones recientes</CardTitle>
          </div>
          <Link href="/reparaciones" className="text-xs text-sky-600 font-medium">
            Ver todo
          </Link>
        </CardHeader>
        {repairs.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Sin reparaciones registradas</p>
        ) : (
          <ul className="space-y-2">
            {repairs.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                </div>
                <Badge
                  variant={
                    item.status === 'resolved'
                      ? 'success'
                      : item.status === 'in_progress'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {item.status === 'pending'
                    ? 'Pendiente'
                    : item.status === 'in_progress'
                    ? 'En curso'
                    : 'Resuelto'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Últimos gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-500" />
            <CardTitle>Últimos gastos</CardTitle>
          </div>
          <Link href="/gastos" className="text-xs text-sky-600 font-medium">
            Ver todo
          </Link>
        </CardHeader>
        {expenses.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Sin gastos registrados</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.concept}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {formatCurrency(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Últimas salidas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <CardTitle>Últimas salidas</CardTitle>
          </div>
          <Link href="/bitacora" className="text-xs text-sky-600 font-medium">
            Ver todo
          </Link>
        </CardHeader>
        {trips.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Sin salidas registradas</p>
        ) : (
          <ul className="space-y-2">
            {trips.map((item) => (
              <li key={item.id} className="py-1">
                <p className="text-sm font-medium text-slate-800">
                  {item.departure_port}
                  {item.arrival_port != null ? ` → ${item.arrival_port}` : ''}
                </p>
                <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/repostajes"
          className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:bg-slate-50 transition-colors"
        >
          <Fuel className="w-5 h-5 text-sky-500" />
          <span className="text-sm font-medium text-slate-700">Repostajes</span>
        </Link>
        <Link
          href="/pesca"
          className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:bg-slate-50 transition-colors"
        >
          <span className="text-xl">🎣</span>
          <span className="text-sm font-medium text-slate-700">Pesca</span>
        </Link>
        <Link
          href="/documentos"
          className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:bg-slate-50 transition-colors"
        >
          <span className="text-xl">📄</span>
          <span className="text-sm font-medium text-slate-700">Documentos</span>
        </Link>
        <Link
          href="/barco"
          className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:bg-slate-50 transition-colors"
        >
          <Anchor className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Mi barco</span>
        </Link>
      </div>
    </div>
  )
}
