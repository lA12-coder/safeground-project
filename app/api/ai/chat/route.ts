import { NextRequest, NextResponse } from 'next/server';
import { generateGroqText, isGroqConfigured } from '@/lib/ai/groq';
import { RAG_SYSTEM_PROMPT, AI_CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { searchKnowledgeBase } from '@/lib/ai/rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const history: { role: string; content: string }[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!isGroqConfigured()) {
      return NextResponse.json(
        { error: 'No AI service configured. Add GROQ_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const chatMessages = history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content),
    }));
    chatMessages.push({ role: 'user', content: message });

    const { context } = await searchKnowledgeBase(message);

    const systemPrompt = context
      ? RAG_SYSTEM_PROMPT.replace('{context}', context)
      : AI_CHAT_SYSTEM_PROMPT;

    const reply = await generateGroqText({
      systemPrompt,
      messages: chatMessages,
      maxTokens: 300,
      temperature: 0.7,
    });

    return NextResponse.json({ success: true, reply, source: 'groq' });
  } catch (error) {
    console.error('[ai/chat] Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable. Check your GROQ_API_KEY and network connection.' },
      { status: 503 }
    );
  }
}
