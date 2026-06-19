'use client'

interface Props {
  action: () => Promise<void>
  message?: string
  label?: string
}

export function ConfirmDeleteButton({
  action,
  message = '¿Eliminar este registro? Esta acción no se puede deshacer.',
  label = 'Eliminar',
}: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault()
        }}
        className="w-full py-3 text-red-600 text-sm font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
      >
        {label}
      </button>
    </form>
  )
}
