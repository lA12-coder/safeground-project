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

    const { alias, language_pref, support_preference, trigger_tags, streak_goal } = await request.json()

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      alias,
      language_pref: language_pref || 'english',
      support_preference: support_preference || 'secular',
      trigger_tags: trigger_tags || [],
      streak_goal: streak_goal || 30,
      onboarding_done: true,
      updated_at: new Date().toISOString(),
    })

    if (profileError) throw profileError

    const { error: streakError } = await supabase.from('streaks').upsert({
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
      total_clean_days: 0,
    })

    if (streakError) throw streakError

    return NextResponse.json({ success: true, profile: { id: user.id, alias } })
  } catch (error) {
    console.error('[profile] Error:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
