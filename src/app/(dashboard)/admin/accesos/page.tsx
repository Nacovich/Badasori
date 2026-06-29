import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'

function parseDevice(ua: string | null): string {
  if (!ua) return '—'
  const mobile = /mobile|android|iphone|ipad|tablet/i.test(ua)
  let browser = 'Otro'
  if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  return (mobile ? 'Móvil' : 'Escritorio') + ' · ' + browser
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

export default async function AccesosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('boat_members')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') redirect('/')

  const { data: logs } = await supabase
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-4">
      <PageHeader title="Log de accesos" backHref="/" />

      <p className="text-sm text-slate-500">
        Últimos 200 accesos a la aplicación (se registra una vez por hora por usuario).
      </p>

      {!logs || logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">
          No hay registros de acceso todavía.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const { date, time } = formatDateTime(log.created_at)
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {log.user_name ?? log.user_email ?? 'Usuario desconocido'}
                    </p>
                    {log.user_name && log.user_email && (
                      <p className="text-xs text-slate-400 truncate">{log.user_email}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{parseDevice(log.user_agent)}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{log.ip_address ?? '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-700">{time}</p>
                    <p className="text-xs text-slate-400">{date}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
