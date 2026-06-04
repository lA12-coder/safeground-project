import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { token, message_type } = await request.json()

    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const { data: guardian } = await supabase
      .from('guardian_controls')
      .select('user_id')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (!guardian) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })

    const messages: Record<string, string> = {
      encourage: 'Your guardian is proud of your progress today.',
      calm: 'Your guardian wants you to know: take a deep breath, you are safe and loved.',
      faith: 'Your guardian is praying for your peace this evening.',
    }

    await supabase.from('notification_logs').insert({
      user_id: guardian.user_id,
      type: 'guardian_encouragement',
      message: messages[message_type] || messages.encourage,
      read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[guardian/encourage] Error:', error)
    return NextResponse.json({ error: 'Failed to send encouragement' }, { status: 500 })
  }
}
