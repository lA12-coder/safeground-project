import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';

interface AffirmationRequest {
  moodScore: number;
  urgeIntensity: number;
}

const SYSTEM_PROMPT =
  'You are a compassionate recovery companion for Ethiopian university students. Generate daily affirmations that are culturally respectful, non-judgmental, and focused on strength and healing.';

const fallbackAffirmations = [
  'Your strength is not measured by your struggles, but by your courage to face them.',
  'You are worthy of peace, healing, and every good thing that comes your way.',
  'Each day you choose yourself is a victory worth celebrating.',
  'Your recovery is a testament to your resilience and self-love.',
  'You are not alone. Many have walked this path and found their light.',
  'Healing is not linear, and that is perfectly okay. You are still moving forward.',
  'Your past does not define your future. You have the power to write a new story.',
  'One breath, one moment, one day. You are doing more than enough.',
  'You deserve to be happy, healthy, and free. Believe it.',
  'Your commitment to yourself today creates the person you want to be tomorrow.',
];

export async function POST(request: NextRequest) {
  try {
    const body: AffirmationRequest = await request.json();
    const { moodScore = 5, urgeIntensity = 5 } = body;

    if (!isGeminiConfigured()) {
      const fallback = fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)];
      return NextResponse.json({
        success: true,
        affirmation: fallback,
        source: 'fallback',
      });
    }

    const contextPrompt = `
The user's current state:
- Mood Score: ${moodScore}/5 (1=very sad, 5=excellent)
- Urge Intensity: ${urgeIntensity}/10 (how strongly they're craving)

Generate a single compassionate, culturally respectful daily affirmation (2-3 sentences) for an Ethiopian university student in recovery from khat addiction.
Use metaphors of strength, nature, and academic focus.
Do NOT mention religion unless directly relevant.
Output ONLY the affirmation text, nothing else.
`;

    const affirmation = await generateGeminiText({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: contextPrompt,
      maxOutputTokens: 150,
      temperature: 0.8,
    });

    return NextResponse.json({
      success: true,
      affirmation,
      source: 'gemini',
    });
  } catch (error) {
    console.error('[affirmation]', error);

    const fallback = fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)];
    return NextResponse.json({
      success: true,
      affirmation: fallback,
      source: 'fallback',
    });
  }
}
