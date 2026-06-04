import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message_id } = await request.json()
    if (!message_id) return NextResponse.json({ error: 'message_id required' }, { status: 400 })

    const { error } = await supabase
      .from('anonymous_chat')
      .update({ is_flagged: true, flag_reason: 'reported' })
      .eq('id', message_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[chat/flag] Error:', error)
    return NextResponse.json({ error: 'Failed to flag message' }, { status: 500 })
  }
}
