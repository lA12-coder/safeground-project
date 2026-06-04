import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    const { messages = [], user_context = {} } = await request.json()
    const { religion = 'none', language_pref = 'english' } = user_context

    const systemPrompt = `You are a multi-faith spiritual companion for Ethiopian university students.
Respect all faiths (Orthodox, Protestant, Muslim, and secular perspectives).
Use metaphors and wisdom that are culturally Ethiopian.
If the user prefers Amharic, respond bilingually.
Keep responses under 200 tokens.
Be warm, non-dogmatic, and compassionate.`

    const lastMessage = messages[messages.length - 1]?.content || 'Share wisdom with me.'
    const contextInfo = `User's faith: ${religion}, Language preference: ${language_pref}`

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallbackResponses = [
        '"Peace is not the absence of struggle, but the presence of God in the midst of it." — Ethiopian Proverb',
        '"The journey of a thousand miles begins with a single step of faith."',
        '"Be still and know that you are held by something greater than your worries."',
        '"Like the roots of the acacia, your faith grows deep in silence.",',
        '"Each dawn is a reminder that mercy is renewed for you."',
      ]
      return NextResponse.json({
        response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      })
    }

    const response = await callClaude(systemPrompt, `${contextInfo}\n\nUser says: ${lastMessage}`, 200)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[faith/companion] Error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
