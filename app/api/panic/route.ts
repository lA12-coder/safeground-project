import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGroqJson, isGroqConfigured } from '@/lib/ai/groq';
import { PANIC_SYSTEM_PROMPT, FALLBACK_PANIC_STEPS, FALLBACK_PANIC_AFFIRMATION } from '@/lib/ai/prompts';

export const runtime = 'nodejs';

type PanicStep = { title: string; instruction: string; duration_seconds: number };

type PanicStepsResult = {
  steps: PanicStep[];
  affirmation: string;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { intensity = 8, context_tags = [] } = body;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: logData } = await supabase
      .from('habit_logs')
      .insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        ai_intervention_triggered: true,
        urge_intensity: intensity,
        trigger_tags: Array.isArray(context_tags) ? context_tags : [],
        mood_score: 3,
        stress_level: 8,
      })
      .select('id')
      .single();

    let steps = FALLBACK_PANIC_STEPS;
    let affirmation = FALLBACK_PANIC_AFFIRMATION;

    if (isGroqConfigured()) {
      try {
        const result = await generateGroqJson<PanicStepsResult>({
          systemPrompt: PANIC_SYSTEM_PROMPT,
          userMessage: `User is experiencing a panic episode. Intensity: ${intensity}/10. Context: ${(context_tags || []).join(', ')}`,
          maxTokens: 1024,
          temperature: 0.5,
        });
        if (result.steps?.length) {
          steps = result.steps;
        }
        if (result.affirmation) {
          affirmation = result.affirmation;
        }
      } catch (e) {
        console.error('[panic] Groq failed, using fallback:', e);
      }
    }

    const { data: guardian } = await supabase
      .from('guardian_controls')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (guardian) {
      await supabase.from('notification_logs').insert({
        user_id: user.id,
        type: 'panic_alert',
        message: 'Panic event triggered. Guardian has been notified.',
        read: false,
      });
    }

    const session_id = logData?.id ?? crypto.randomUUID();

    return NextResponse.json({
      session_id,
      steps,
      affirmation,
      breathing_duration: 38,
    });
  } catch (error) {
    console.error('[panic] Error:', error);
    return NextResponse.json({ error: 'Failed to process panic alert' }, { status: 500 });
  }
}
