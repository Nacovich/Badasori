'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, User, ChevronDown, ScrollText } from 'lucide-react'
import type { Profile } from '@/types'

interface TopBarProps {
  title: string
  profile?: Profile | null
  isAdmin?: boolean
}

export function TopBar({ title, profile, isAdmin }: TopBarProps) {
  const [open, setOpen] = useState(false)

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
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">
                  {profile?.full_name ?? 'Usuario'}
                </p>
              </div>

              {isAdmin && (
                <Link
                  href="/admin/accesos"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ScrollText className="w-4 h-4 text-slate-400" />
                  Log de accesos
                </Link>
              )}

              <form method="POST" action="/auth/signout">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
