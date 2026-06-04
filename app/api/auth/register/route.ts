import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password, alias, language_pref } = await request.json()

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid email or password (min 6 chars)' }, { status: 400 })
    }

    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { alias: alias || email.split('@')[0], language_pref: language_pref || 'en' },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, user: { id: data.user.id, email: data.user.email } })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.signInWithPassword({ email, password })

    return response
  } catch (error) {
    console.error('[auth/register] Error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
