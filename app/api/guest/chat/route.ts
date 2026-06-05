import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';
import { GUEST_CHAT_SYSTEM_PROMPT, FALLBACK_REPLIES } from '@/lib/ai/prompts';
import { GUEST_WELCOME_MESSAGE } from '@/lib/guest/constants';

export const runtime = 'nodejs';

const sessionCounts = new Map<string, number>();
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = GUEST_CHAT_SYSTEM_PROMPT + `\n\nYour first message is: "${GUEST_WELCOME_MESSAGE}"`;

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
      const reply = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
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
    const reply = FALLBACK_REPLIES[0];
    return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
  }
}
