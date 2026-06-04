import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { callClaudeJSON } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { intensity, context_tags } = await request.json()

    await supabase.from('habit_logs').insert({
      user_id: user.id,
      log_date: new Date().toISOString().split('T')[0],
      ai_intervention_triggered: true,
      urge_intensity: intensity || 8,
      trigger_tags: context_tags || [],
      mood_score: 3,
      stress_level: 8,
    })

    let steps: string[] = [
      'Breathe deeply for 4 seconds. Hold for 4. Exhale for 4.',
      'Name 5 things you can see around you right now.',
      'Repeat: "This feeling is temporary. I am safe."',
      'Stand up and stretch your arms upward for 10 seconds.',
      'Drink a glass of cold water slowly.',
    ]
    let affirmation = 'You have survived every difficult moment so far. This too shall pass.'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const result = await callClaudeJSON<{ steps: string[]; affirmation: string }>(
          'You are a crisis response counselor for Ethiopian students in recovery from khat addiction. Generate 5 grounding steps and 1 short affirmation. Respond ONLY with JSON: { "steps": string[], "affirmation": string }',
          `User is experiencing a panic episode. Intensity: ${intensity}/10. Context: ${(context_tags || []).join(', ')}`,
          300
        )
        steps = result.steps
        affirmation = result.affirmation
      } catch {}
    }

    const { data: guardian } = await supabase
      .from('guardian_controls')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (guardian) {
      await supabase.from('notification_logs').insert({
        user_id: user.id,
        type: 'panic_alert',
        message: 'Panic event triggered. Guardian has been notified.',
        read: false,
      })
    }

    const session_id = crypto.randomUUID?.() || Math.random().toString(36).slice(2)

    return NextResponse.json({
      session_id,
      steps,
      affirmation,
    })
  } catch (error) {
    console.error('[panic] Error:', error)
    return NextResponse.json({ error: 'Failed to process panic alert' }, { status: 500 })
  }
}
