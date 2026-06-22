import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  purple: 'bg-violet-100 text-violet-700',
  teal: 'bg-teal-100 text-teal-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
