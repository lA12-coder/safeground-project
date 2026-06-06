import { NextRequest, NextResponse } from 'next/server';
import { generateGroqText, isGroqConfigured } from '@/lib/ai/groq';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';
import { RAG_SYSTEM_PROMPT, GUEST_CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { GUEST_WELCOME_MESSAGE } from '@/lib/guest/constants';
import { searchKnowledgeBase } from '@/lib/ai/rag';

export const runtime = 'nodejs';

const sessionCounts = new Map<string, number>();
const MAX_MESSAGES = 20;

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
      return NextResponse.json({ success: true, reply: limitReply, response: limitReply });
    }

    const chatHistory = history.slice(-8).map((m: { role: string; content: string }) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: String(m.content),
    }));

    const { context } = await searchKnowledgeBase(message);

    const systemPrompt = context
      ? RAG_SYSTEM_PROMPT.replace('{context}', context)
      : GUEST_CHAT_SYSTEM_PROMPT;

    let reply: string;
    let source: string;

    if (isGroqConfigured()) {
      try {
        reply = await generateGroqText({
          systemPrompt,
          messages: [...chatHistory, { role: 'user', content: message }],
          maxTokens: 200,
          temperature: 0.7,
        });
        source = 'groq';
      } catch (err) {
        console.error('[guest/chat] Groq failed, trying Gemini:', err);
        reply = await generateGeminiText({
          systemPrompt,
          userMessage: message,
          history: chatHistory.length ? chatHistory : undefined,
          maxOutputTokens: 200,
          temperature: 0.7,
        });
        source = 'gemini';
      }
    } else if (isGeminiConfigured()) {
      reply = await generateGeminiText({
        systemPrompt,
        userMessage: message,
        history: chatHistory.length ? chatHistory : undefined,
        maxOutputTokens: 200,
        temperature: 0.7,
      });
      source = 'gemini';
    } else {
      return NextResponse.json(
        { error: 'No AI service configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    sessionCounts.set(session_id, count + 1);

    return NextResponse.json({ success: true, reply, response: reply, source });
  } catch (error) {
    console.error('[guest/chat] Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable. Check your GROQ_API_KEY or GEMINI_API_KEY.' },
      { status: 503 }
    );
  }
}
