'use client'

interface Props {
  deleteAction: () => Promise<void>
}

export function DeleteAttachmentButton({ deleteAction }: Props) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        if (!confirm('¿Eliminar este archivo?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
        aria-label="Eliminar adjunto"
      >
        ×
      </button>
    </form>
  )
}
