import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const update: Record<string, any> = {}

    if (body.status) update.status = body.status
    if (body.scheduled_at) update.scheduled_at = body.scheduled_at

    const { error } = await supabase
      .from('telehealth_bookings')
      .update(update)
      .eq('id', id)
      .eq('provider_id', user.id)

    if (error) throw error

    const action = body.status === 'confirmed' ? 'confirmed'
      : body.status === 'cancelled' ? 'cancelled'
      : body.scheduled_at ? 'rescheduled'
      : 'updated'

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error('[provider/bookings/update] Error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
