import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password, alias, language_pref } = await request.json()

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid email or password (min 6 chars)' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { alias: alias || email.split('@')[0], language_pref: language_pref || 'en' },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const anonSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { error: signInError } = await anonSupabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: { id: data.user.id, email: data.user.email } })
  } catch (error) {
    console.error('[auth/register] Error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
