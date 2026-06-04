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

    const { provider_id, scheduled_at, session_type, notes } = await request.json()

    if (!provider_id || !scheduled_at) {
      return NextResponse.json({ error: 'provider_id and scheduled_at required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('telehealth_bookings').insert({
      user_id: user.id,
      provider_id,
      session_type: session_type || 'initial',
      scheduled_at,
      duration_minutes: 50,
      notes: notes || null,
      status: 'pending',
    }).select('id').single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      booking_id: data.id,
      message: 'Booking confirmed',
    }, { status: 201 })
  } catch (error) {
    console.error('[bookings] Error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
