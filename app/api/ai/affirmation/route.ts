import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';
import { AI_AFFIRMATION_SYSTEM_PROMPT, AI_AFFIRMATION_USER_PROMPT, FALLBACK_AFFIRMATIONS } from '@/lib/ai/prompts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mood_score = body.mood_score ?? body.moodScore ?? 5;
    const urge_intensity = body.urge_intensity ?? body.urgeIntensity ?? 5;

    if (isGeminiConfigured()) {
      try {
        const userMessage = AI_AFFIRMATION_USER_PROMPT(mood_score, urge_intensity);

        const affirmation = await generateGeminiText({
          systemPrompt: AI_AFFIRMATION_SYSTEM_PROMPT,
          userMessage,
          maxOutputTokens: 150,
          temperature: 0.8,
        });

        return NextResponse.json({ success: true, affirmation, source: 'gemini' });
      } catch (e) {
        console.error('[ai/affirmation] Gemini failed:', e);
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
