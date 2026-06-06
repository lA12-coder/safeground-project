import { NextRequest, NextResponse } from 'next/server';
import { generateGroqText, isGroqConfigured, isGroqRateLimitError } from '@/lib/ai/groq';
import { GUEST_CHAT_SYSTEM_PROMPT, FALLBACK_REPLIES } from '@/lib/ai/prompts';

export const runtime = 'nodejs';

const sessionCounts = new Map<string, number>();
const MAX_MESSAGES = 20;

function pickFallbackReply(): string {
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

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
        'You have reached the guest message limit. Create a free account for 20 AI assistant requests, then upgrade to AI Plus for unlimited access.';
      return NextResponse.json({ success: true, reply: limitReply, response: limitReply });
    }

    if (!isGroqConfigured()) {
      const reply = pickFallbackReply();
      sessionCounts.set(session_id, count + 1);
      return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
    }

    const chatHistory = history.slice(-8).map((m: { role: string; content: string }) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: String(m.content),
    }));

    // Guest chat uses Groq only — no RAG (avoids OpenAI embedding quota/latency).
    let reply: string;
    let source: 'groq' | 'fallback' = 'groq';

    try {
      reply = await generateGroqText({
        systemPrompt: GUEST_CHAT_SYSTEM_PROMPT,
        messages: [...chatHistory, { role: 'user', content: message }],
        maxTokens: 200,
        temperature: 0.4,
      });
      if (!reply.trim()) {
        reply = pickFallbackReply();
        source = 'fallback';
      }
    } catch (error) {
      if (isGroqRateLimitError(error)) {
        console.warn('[guest/chat] Groq rate limit — using fallback reply');
      } else {
        console.error('[guest/chat] Groq failed:', error);
      }
      reply = pickFallbackReply();
      source = 'fallback';
    }

    sessionCounts.set(session_id, count + 1);

    return NextResponse.json({ success: true, reply, response: reply, source });
  } catch (error) {
    console.error('[guest/chat] Error:', error);
    const reply = pickFallbackReply();
    return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
  }
}
