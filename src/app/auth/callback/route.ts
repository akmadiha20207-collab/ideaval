import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback - Code:', code, 'Error:', error, 'Next:', next)

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=session_exchange_failed`)
      }

      console.log('Session exchange successful:', data)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Unexpected error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
    }
  }

  // If no code and no error, redirect to dashboard (user might be already authenticated)
  console.log('No code provided, redirecting to dashboard')
  return NextResponse.redirect(`${origin}/dashboard`)
}
