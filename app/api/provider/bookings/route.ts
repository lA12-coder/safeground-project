import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
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
      .select('id, name, specialization, online, in_person, is_verified, rating')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single()

    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    const status = request.nextUrl.searchParams.get('status')

    let query = supabase
      .from('telehealth_bookings')
      .select('*, profiles(alias)')
      .eq('provider_id', provider.id)
      .order('scheduled_at', { ascending: true })

    if (status) query = query.eq('status', status)

    const { data: bookings, error } = await query
    if (error) throw error

    return NextResponse.json({
      provider,
      bookings: (bookings || []).map((b: any) => ({
        id: b.id,
        alias: b.profiles?.alias || 'Anonymous',
        scheduled_at: b.scheduled_at,
        session_type: b.session_type,
        duration_minutes: b.duration_minutes,
        status: b.status,
        notes: b.notes,
        meeting_link: b.meeting_link,
      })),
    })
  } catch (error) {
    console.error('[provider/bookings] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
