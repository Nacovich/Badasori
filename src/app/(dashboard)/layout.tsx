import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Barco Manager" profile={profile as Profile | null} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
