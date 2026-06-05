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

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single()

    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    const { booking_id, notes } = await request.json()

    const { error } = await supabase
      .from('telehealth_bookings')
      .update({ notes })
      .eq('id', booking_id)
      .eq('provider_id', provider.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[provider/notes] Error:', error)
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}
