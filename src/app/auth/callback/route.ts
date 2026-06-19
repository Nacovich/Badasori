import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') ?? ''

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const dest = type === 'recovery' ? '/auth/reset-password' : '/'
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]['type'],
    })
    if (!error) {
      const dest = type === 'recovery' ? '/auth/reset-password' : '/'
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_expirado`)
}
