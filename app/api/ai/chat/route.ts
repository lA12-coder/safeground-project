import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGroqText, isGroqConfigured } from '@/lib/ai/groq';
import { RAG_SYSTEM_PROMPT, AI_CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { searchKnowledgeBase } from '@/lib/ai/rag';
import { aiLimitResponse, consumeAiRequest } from '@/lib/billing/ai-access';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sign in to use the AI assistant.' }, { status: 401 });
    }

    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const history: { role: string; content: string }[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const { ok, access } = await consumeAiRequest(supabase, user.id);
    if (!ok) {
      return NextResponse.json(aiLimitResponse(access), { status: 402 });
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
      temperature: 0.4,
    });

    return NextResponse.json({
      success: true,
      reply,
      source: 'groq',
      usage: {
        ai_requests_used: access.aiRequestsUsed,
        ai_requests_limit: access.aiRequestsLimit,
        remaining: access.remaining,
        plan: access.plan,
      },
    });
  } catch (error) {
    console.error('[ai/chat] Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable. Check your GROQ_API_KEY and network connection.' },
      { status: 503 }
    );
  }
}
