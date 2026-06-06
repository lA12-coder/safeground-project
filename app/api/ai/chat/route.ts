import { NextRequest, NextResponse } from 'next/server';
import { generateGroqText, isGroqConfigured } from '@/lib/ai/groq';
import { generateChatText, openAIAvailable } from '@/lib/ai/openrouter';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';
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

    const chatMessages = history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content),
    }));
    chatMessages.push({ role: 'user', content: message });

    const { context } = await searchKnowledgeBase(message);

    const systemPrompt = context
      ? RAG_SYSTEM_PROMPT.replace('{context}', context)
      : AI_CHAT_SYSTEM_PROMPT;

    if (isGroqConfigured()) {
      try {
        const reply = await generateGroqText({
          systemPrompt,
          messages: chatMessages,
          maxTokens: 300,
          temperature: 0.7,
        });
        return NextResponse.json({ success: true, reply, source: 'groq' });
      } catch (err) {
        console.error('[ai/chat] Groq failed:', err);
      }
    }

    if (openAIAvailable()) {
      try {
        const reply = await generateChatText({
          systemPrompt,
          messages: chatMessages,
          maxTokens: 300,
          temperature: 0.7,
        });
        return NextResponse.json({ success: true, reply, source: 'openai' });
      } catch (err) {
        console.error('[ai/chat] OpenAI failed:', err);
      }
    }

    if (isGeminiConfigured()) {
      const lastUserMsg = [...chatMessages].reverse().find((m) => m.role === 'user');
      const history = chatMessages.slice(0, -1);
      const reply = await generateGeminiText({
        systemPrompt,
        userMessage: lastUserMsg?.content ?? message,
        history: history.length ? history : undefined,
        maxOutputTokens: 300,
        temperature: 0.7,
      });
      return NextResponse.json({ success: true, reply, source: 'gemini' });
    }

    return NextResponse.json(
      { error: 'No AI service configured. Add GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to .env.local' },
      { status: 503 }
    );
  } catch (error) {
    console.error('[ai/chat] Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable. Check your API keys and network connection.' },
      { status: 503 }
    );
  }
}
