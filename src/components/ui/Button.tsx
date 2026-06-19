import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  danger: 'bg-red-500 hover:bg-red-400 text-white',
  ghost: 'hover:bg-slate-100 text-slate-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? 'Guardando...' : children}
    </button>
  )
}
