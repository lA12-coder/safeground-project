import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';
import { GUEST_WELCOME_MESSAGE } from '@/lib/guest/constants';

const SYSTEM_PROMPT = `You are SafeGround AI. A warm, anonymous, non-judgmental recovery support companion for Ethiopian students.

Your first message is: "${GUEST_WELCOME_MESSAGE}"

Keep responses under 100 words. Never mention pornography directly. Focus on grounding, hope, cultural sensitivity, and professional help when appropriate.`;

const FALLBACK_REPLIES = [
  'Thank you for sharing. You are safe here. Take one slow breath — in for four counts, out for six. What feels heaviest right now?',
  'I hear you. This moment is hard, and you are still showing up for yourself. Would a short grounding exercise or a quiet pause help?',
  'Your courage to reach out matters. You are not alone on this path. What small comfort could you offer yourself in the next ten minutes?',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!isGeminiConfigured()) {
      const reply = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
      return NextResponse.json({ success: true, reply, source: 'fallback' });
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

    return NextResponse.json({ success: true, reply, source: 'gemini' });
  } catch (error) {
    console.error('[guest/chat]', error);
    return NextResponse.json({
      success: true,
      reply: FALLBACK_REPLIES[0],
      source: 'fallback',
    });
  }
}
