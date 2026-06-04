import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const milestoneDays = [3, 7, 14, 30, 60, 90]

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, completed_steps } = await request.json()

    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()

    const current = streak?.current_streak || 0

    const newMilestones: number[] = []
    for (const day of milestoneDays) {
      if (current >= day) {
        const { data: existing } = await supabase
          .from('milestones')
          .select('id')
          .eq('user_id', user.id)
          .eq('days', day)
          .single()

        if (!existing) {
          await supabase.from('milestones').insert({
            user_id: user.id,
            days: day,
            achieved_at: new Date().toISOString(),
          })
          newMilestones.push(day)
        }
      }
    }

    return NextResponse.json({
      success: true,
      streak_protected: true,
      current_streak: current,
      new_milestones: newMilestones,
    })
  } catch (error) {
    console.error('[panic/complete] Error:', error)
    return NextResponse.json({ error: 'Failed to complete panic session' }, { status: 500 })
  }
}
