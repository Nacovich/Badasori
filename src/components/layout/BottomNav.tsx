'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Anchor,
  Wrench,
  Receipt,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/barco', label: 'Barco', icon: Anchor },
  { href: '/mantenimiento', label: 'Mant.', icon: Wrench },
  { href: '/gastos', label: 'Gastos', icon: Receipt },
  { href: '/bitacora', label: 'Bitácora', icon: BookOpen },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
