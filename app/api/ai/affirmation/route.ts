import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateGroqSingleTurn,
  isGroqConfigured,
  isGroqRateLimitError,
} from '@/lib/ai/groq';
import { AI_AFFIRMATION_SYSTEM_PROMPT, AI_AFFIRMATION_USER_PROMPT, FALLBACK_AFFIRMATIONS } from '@/lib/ai/prompts';
import { aiLimitResponse, consumeAiRequest } from '@/lib/billing/ai-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const mood_score = body.mood_score ?? body.moodScore ?? 5;
    const urge_intensity = body.urge_intensity ?? body.urgeIntensity ?? 5;

    if (user) {
      const { ok, access } = await consumeAiRequest(supabase, user.id);
      if (!ok) {
        return NextResponse.json(aiLimitResponse(access), { status: 402 });
      }
    }

    if (isGroqConfigured()) {
      try {
        const userMessage = AI_AFFIRMATION_USER_PROMPT(mood_score, urge_intensity);

        const affirmation = await generateGroqSingleTurn({
          systemPrompt: AI_AFFIRMATION_SYSTEM_PROMPT,
          userMessage,
          maxTokens: 150,
          temperature: 0.8,
        });

        return NextResponse.json({ success: true, affirmation, source: 'groq' });
      } catch (e) {
        if (isGroqRateLimitError(e)) {
          console.warn('[ai/affirmation] Groq rate limit — using fallback affirmation');
        } else {
          console.error('[ai/affirmation] Groq failed:', e);
        }
      }
    }

    const affirmation =
      FALLBACK_AFFIRMATIONS[Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length)];
    return NextResponse.json({ success: true, affirmation, source: 'fallback' });
  } catch (error) {
    console.error('[ai/affirmation] Error:', error);
    const affirmation =
      FALLBACK_AFFIRMATIONS[Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length)];
    return NextResponse.json({ success: true, affirmation, source: 'fallback' });
  }
}
