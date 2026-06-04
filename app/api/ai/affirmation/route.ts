import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/ai/claude'

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
  'You are braver than you believe, stronger than you seem, and loved more than you know.',
  'Every step you take toward healing is a step toward the person you were meant to be.',
  'The sun rises even after the darkest night. So will you.',
  'Your worth is not determined by your setbacks, but by your courage to rise again.',
  'Be gentle with yourself today. You are doing the best you can with what you have.',
  'You carry within you the strength to overcome any challenge that comes your way.',
  'Recovery is not about perfection. It is about progress, one day at a time.',
  'You are not defined by your worst moments. You are defined by how you rise from them.',
  'There is power in asking for help. It shows courage, not weakness.',
  'Your journey is your own. Honor it with patience and love.',
]

export async function POST(request: NextRequest) {
  try {
    const { mood_score, urge_intensity } = await request.json()

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const systemPrompt = 'You are a compassionate recovery companion for Ethiopian university students. Generate daily affirmations that are culturally respectful, non-judgmental, and focused on strength and healing. Output ONLY the affirmation text, nothing else.'

        const userMessage = `The user's current state:
- Mood Score: ${mood_score ?? 5}/10
- Urge Intensity: ${urge_intensity ?? 5}/10

Generate a single compassionate, culturally respectful daily affirmation (2-3 sentences) for an Ethiopian university student in recovery from khat addiction. Use metaphors of strength, nature, and academic focus. Do NOT mention religion unless directly relevant.`

        const affirmation = await callClaude(systemPrompt, userMessage, 150)
        return NextResponse.json({ affirmation })
      } catch {
        // Fallthrough to fallback
      }
    }

    const affirmation = fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)]
    return NextResponse.json({ affirmation })
  } catch (error) {
    console.error('[ai/affirmation] Error:', error)
    const affirmation = fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)]
    return NextResponse.json({ affirmation })
  }
}
