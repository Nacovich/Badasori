import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { RevalidateOnFocus } from '@/components/RevalidateOnFocus'
import type { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('boat_members').select('role').eq('user_id', user.id).single(),
  ])

  const isAdmin = membership?.role === 'admin'

  // Log access once per hour (fire-and-forget)
  void (async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('access_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (!count || count === 0) {
      const hdrs = await headers()
      const ip =
        hdrs.get('x-forwarded-for')?.split(',')[0].trim() ??
        hdrs.get('x-real-ip') ??
        'desconocido'
      const ua = hdrs.get('user-agent') ?? ''

      await supabase.from('access_logs').insert({
        user_id: user.id,
        user_email: user.email,
        user_name: (profile as Profile | null)?.full_name ?? null,
        ip_address: ip,
        user_agent: ua,
      })
    }
  })()

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Boat Manager" profile={profile as Profile | null} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">{children}</div>
      </main>
      <BottomNav />
      <RevalidateOnFocus />
    </div>
  )
}
