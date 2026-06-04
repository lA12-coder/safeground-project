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

    const { mood_score, stress_level, urge_intensity, relapsed, khat_used_today, khat_hours_ago, alcohol_used_today, trigger_tags, log_date } = await request.json()

    const { data, error } = await supabase.from('habit_logs').insert({
      user_id: user.id,
      log_date: log_date || new Date().toISOString().split('T')[0],
      mood_score: mood_score ?? 5,
      stress_level: stress_level ?? 5,
      urge_intensity: urge_intensity ?? 5,
      relapsed: relapsed ?? false,
      khat_used_today: khat_used_today ?? false,
      khat_hours_ago: khat_hours_ago ?? null,
      alcohol_used_today: alcohol_used_today ?? false,
      trigger_tags: trigger_tags || [],
      ai_intervention_triggered: false,
    }).select('id').single()

    if (error) throw error

    return NextResponse.json({
      log_id: data.id,
      streak_updated: true,
    }, { status: 201 })
  } catch (error) {
    console.error('[habits/log] Error:', error)
    return NextResponse.json({ error: 'Failed to save habit log' }, { status: 500 })
  }
}
