import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
import { GUEST_WELCOME_MESSAGE } from '@/lib/guest/constants';

const sessionCounts = new Map<string, number>();
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = `You are SafeGround AI. A warm, anonymous, non-judgmental recovery support companion for Ethiopian students.

Your first message is: "${GUEST_WELCOME_MESSAGE}"

Keep responses under 100 words. Never mention pornography directly. Focus on grounding, hope, cultural sensitivity, and professional help when appropriate.`;

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
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const session_id =
      body.session_id ?? `guest_${request.headers.get('x-forwarded-for') ?? 'anon'}`;

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const count = sessionCounts.get(session_id) || 0;
    if (count >= MAX_MESSAGES) {
      const limitReply =
        'You have reached the message limit for this session. Consider creating a free account for unlimited support.';
      return NextResponse.json({
        success: true,
        reply: limitReply,
        response: limitReply,
      });
    }

    if (!isGeminiConfigured()) {
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      sessionCounts.set(session_id, count + 1);
      return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
    }

    const chatHistory = history.slice(-8).map((m: { role: string; content: string }) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: String(m.content),
    }));

    const reply = await generateGeminiText({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: message,
      history: chatHistory.length ? chatHistory : undefined,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    sessionCounts.set(session_id, count + 1);

    return NextResponse.json({ success: true, reply, response: reply, source: 'gemini' });
  } catch (error) {
    console.error('[guest/chat] Error:', error);
    const reply = fallbackReplies[0];
    return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
  }
}
