import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGeminiJson, isGeminiConfigured } from '@/lib/ai/gemini';

type PanicStepsResult = {
  steps: { title: string; instruction: string; duration_seconds: number }[];
  affirmation: string;
};

const FALLBACK_RESULT: PanicStepsResult = {
  steps: [
    {
      title: 'Grounding',
      instruction:
        'Look around your immediate environment. Name five things you can see right now.',
      duration_seconds: 90,
    },
    {
      title: 'Breathing',
      instruction: 'Take a slow, deep breath in, and let it out just as slowly.',
      duration_seconds: 90,
    },
    {
      title: 'Distraction',
      instruction: 'Wiggle your toes and focus entirely on how that feels.',
      duration_seconds: 90,
    },
    {
      title: 'Connection',
      instruction: 'Think of someone you care about deeply.',
      duration_seconds: 90,
    },
    {
      title: 'Affirmation',
      instruction: "Repeat: 'I am safe and this feeling will pass.'",
      duration_seconds: 90,
    },
  ],
  affirmation: 'You are stronger than this moment.',
};

const PANIC_SYSTEM_PROMPT = `You are a CBT urge-surfing coach for Ethiopian students.
Generate 5 grounding steps for immediate crisis intervention.
Return JSON ONLY with this shape:
{ "steps": [{"title": "string", "instruction": "string", "duration_seconds": number}], "affirmation": "string" }`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const body = await request.json().catch(() => ({}));
    const { user_id: bodyUserId, intensity = 10, context_tags = [] } = body;
    const userId = user?.id ?? bodyUserId ?? null;

    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .insert([
        {
          user_id: userId,
          log_type: 'panic',
          ai_intervention_triggered: true,
          intensity,
          context_tags: Array.isArray(context_tags) ? context_tags : [],
          status: 'active',
        },
      ])
      .select('id')
      .single();

    if (logError) {
      console.error(
        'Failed to log panic event to Supabase (this may be normal if schema is missing):',
        logError
      );
    }

    const sessionId = logData?.id || `session_${Date.now()}`;

    let aiResult: PanicStepsResult = FALLBACK_RESULT;

    try {
      if (!isGeminiConfigured()) {
        throw new Error('Missing GEMINI_API_KEY');
      }

      aiResult = await generateGeminiJson<PanicStepsResult>({
        systemPrompt: PANIC_SYSTEM_PROMPT,
        userMessage: `User is reporting a panic/urge intensity of ${intensity}/10. Context: ${Array.isArray(context_tags) ? context_tags.join(', ') : ''}`,
        maxOutputTokens: 1024,
        temperature: 0.5,
      });
    } catch (e) {
      console.error('Gemini API or parsing failed, using fallback steps:', e);
    }

    return NextResponse.json(
      {
        session_id: sessionId,
        steps: aiResult.steps,
        affirmation: aiResult.affirmation,
        breathing_duration: 38,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Panic API error:', error);
    return NextResponse.json({ error: 'Failed to process panic intervention' }, { status: 500 });
  }
}
