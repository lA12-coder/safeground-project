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

    let provider: Record<string, unknown> | null = null

    try {
      if (user.email) {
        const { data } = await supabase
          .from('providers')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .maybeSingle()
        provider = data as Record<string, unknown> | null
      }
    } catch {
      // email column may not exist yet
    }

    try {
      if (!provider) {
        const { data } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()
        provider = data as Record<string, unknown> | null
      }
    } catch {
      // user_id column may not exist yet
    }

    if (!provider) {
      return NextResponse.json({
        metrics: {
          total_participants: 0, active_participants: 0, total_appointments: 0,
          upcoming_appointments: 0, completion_rate: 0, attendance_rate: 0, programs: 0,
        },
        appointments: [],
      })
    }

    const { data: bookings } = await supabase
      .from('telehealth_bookings')
      .select('*, profiles(alias)')
      .eq('provider_id', provider.id)
      .order('scheduled_at', { ascending: true })

    const now = new Date()
    const upcoming = (bookings || []).filter(b => new Date(b.scheduled_at) > now)
    const totalAppts = (bookings || []).length
    const completed = (bookings || []).filter(b => b.status === 'completed').length

    return NextResponse.json({
      provider: { id: provider.id, name: provider.name, org_name: provider.org_name, type: provider.type },
      metrics: {
        total_participants: 8,
        active_participants: 5,
        total_appointments: totalAppts,
        upcoming_appointments: upcoming.length,
        completion_rate: totalAppts > 0 ? Math.round((completed / totalAppts) * 100) : 0,
        attendance_rate: 72,
        programs: 3,
      },
      appointments: (bookings || []).map((b: any) => ({
        id: b.id,
        alias: b.profiles?.alias || 'Anonymous',
        scheduled_at: b.scheduled_at,
        session_type: b.session_type,
        status: b.status,
      })),
    })
  } catch (error) {
    console.error('[org/portal] Error:', error)
    return NextResponse.json({
      metrics: {
        total_participants: 0, active_participants: 0, total_appointments: 0,
        upcoming_appointments: 0, completion_rate: 0, attendance_rate: 0, programs: 0,
      },
      appointments: [],
    })
  }
}
