import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        {backHref && (
          <Link href={backHref} className="p-1 -ml-1 text-slate-500 hover:text-slate-700">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        )}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      {action}
    </div>
  )
}
