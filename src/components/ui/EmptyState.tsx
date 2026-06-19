interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {icon && <div className="mb-3 text-slate-300">{icon}</div>}
      <p className="text-slate-500 font-medium">{title}</p>
      {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
    </div>
  )
}
