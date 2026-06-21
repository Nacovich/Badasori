'use client'

import { useState } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { Profile } from '@/types'

interface TopBarProps {
  title: string
  profile?: Profile | null
}

export function TopBar({ title, profile }: TopBarProps) {
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between safe-area-top">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-sm hidden sm:block">
            {profile?.full_name ?? 'Usuario'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">
                  {profile?.full_name ?? 'Usuario'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
