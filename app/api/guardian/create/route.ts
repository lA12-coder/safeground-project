import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { guardian_alias, relationship, monitoring_level, notify_on_panic, notify_on_relapse, notify_streak_break } = await request.json()

    const token = crypto.randomBytes(32).toString('hex')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const access_url = `${appUrl}/guardian/${token}`

    const { error } = await supabase.from('guardian_controls').insert({
      user_id: user.id,
      guardian_alias: guardian_alias || 'Guardian',
      relationship: relationship || 'trusted_friend',
      monitoring_level: monitoring_level || 'alert_only',
      notify_on_panic: notify_on_panic ?? true,
      notify_on_relapse: notify_on_relapse ?? false,
      notify_streak_break: notify_streak_break ?? false,
      token,
      is_active: true,
    })

    if (error) throw error

    return NextResponse.json({ token, access_url })
  } catch (error) {
    console.error('[guardian/create] Error:', error)
    return NextResponse.json({ error: 'Failed to create guardian link' }, { status: 500 })
  }
}
