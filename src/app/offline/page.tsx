'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
      <div className="text-6xl mb-4">⚓</div>
      <h1 className="text-2xl font-bold text-white mb-2">Sin conexión</h1>
      <p className="text-slate-400 text-sm max-w-xs">
        Comprueba tu conexión a internet e inténtalo de nuevo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 active:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
