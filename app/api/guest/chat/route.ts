import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/ai/claude'

const sessionCounts = new Map<string, number>()
const MAX_MESSAGES = 20

const fallbackReplies = [
  'Welcome. You are safe and anonymous here. How are you feeling in this moment?',
  'Thank you for sharing. It takes courage to open up.',
  'You are not alone in this. Many students face similar challenges.',
  'Take a deep breath. You are exactly where you need to be.',
  'Your feelings are valid. There is no wrong way to feel right now.',
  'Recovery is not a straight line. Every step counts.',
  'You deserve support and compassion.',
  'Would you like to try a breathing exercise together?',
  'That sounds difficult. I am here to listen without judgment.',
  'You are doing so much better than you think.',
]

export async function POST(request: NextRequest) {
  try {
    const { message, session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    const count = sessionCounts.get(session_id) || 0
    if (count >= MAX_MESSAGES) {
      return NextResponse.json({
        response: 'You have reached the message limit for this session. Consider creating a free account for unlimited support.',
      })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      sessionCounts.set(session_id, count + 1)
      return NextResponse.json({
        response: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)],
      })
    }

    const response = await callClaude(
      'You are SafeGround AI. A warm, anonymous, non-judgmental recovery support companion for Ethiopian students. Your first message is: "Welcome. You are safe and anonymous here. How are you feeling in this moment?" Keep responses under 100 words. Never mention pornography directly.',
      message || 'Start conversation',
      150
    )

    sessionCounts.set(session_id, count + 1)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[guest/chat] Error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
