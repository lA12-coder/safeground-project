import { NextRequest, NextResponse } from 'next/server';
import { generateChatTextWithFallback, type ChatMessage } from '@/lib/ai/openrouter';
import { AI_CHAT_SYSTEM_PROMPT, FALLBACK_REPLIES } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const chatMessages = history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content),
    }));
    chatMessages.push({ role: 'user', content: message });

    const { reply, source } = await generateChatTextWithFallback({
      systemPrompt: AI_CHAT_SYSTEM_PROMPT,
      messages: chatMessages,
      maxTokens: 300,
      temperature: 0.7,
      fallbacks: FALLBACK_REPLIES,
    });

    return NextResponse.json({ success: true, reply, source });
  } catch (error) {
    console.error('[ai/chat] Error:', error);
    return NextResponse.json(
      { success: true, reply: FALLBACK_REPLIES[0], source: 'fallback' },
      { status: 200 }
    );
  }
}
