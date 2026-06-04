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

    const { error } = await supabase
      .from('guardian_controls')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Guardian access revoked' })
  } catch (error) {
    console.error('[guardian/revoke] Error:', error)
    return NextResponse.json({ error: 'Failed to revoke guardian' }, { status: 500 })
  }
}
