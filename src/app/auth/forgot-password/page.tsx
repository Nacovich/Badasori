'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Anchor } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-xl font-bold text-slate-900">Email enviado</h1>
          <p className="text-sm text-slate-500">
            Revisa tu bandeja de entrada y haz clic en el enlace para establecer una nueva contraseña.
          </p>
          <Link href="/login" className="block text-sm text-sky-500 hover:underline mt-2">
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-sky-500 rounded-2xl p-4 mb-4">
            <Anchor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recuperar acceso</h1>
          <p className="text-slate-400 text-sm mt-1">Te enviaremos un enlace por email</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Volver al login
          </Link>
        </form>
      </div>
    </div>
  )
}
