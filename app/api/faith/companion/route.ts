import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGroqSingleTurn, isGroqConfigured } from '@/lib/ai/groq';
import { FAITH_COMPANION_SYSTEM_PROMPT, FALLBACK_FAITH_RESPONSES } from '@/lib/ai/prompts';
import { aiLimitResponse, consumeAiRequest } from '@/lib/billing/ai-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const user_context = body.user_context ?? {};

    const lastFromMessages = messages[messages.length - 1]?.content;
    const userMessage = message || lastFromMessages || 'Share wisdom with me.';

    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (user) {
      const { ok, access } = await consumeAiRequest(supabase, user.id);
      if (!ok) {
        return NextResponse.json(aiLimitResponse(access), { status: 402 });
      }
    }

    if (!isGroqConfigured()) {
      const reply =
        FALLBACK_FAITH_RESPONSES[Math.floor(Math.random() * FALLBACK_FAITH_RESPONSES.length)];
      return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
    }

    const { religion = 'none', language_pref = 'english' } = user_context;
    const contextInfo = `User's faith: ${religion}, Language preference: ${language_pref}`;

    const reply = await generateGroqSingleTurn({
      systemPrompt: FAITH_COMPANION_SYSTEM_PROMPT,
      userMessage: `${contextInfo}\n\nUser says: ${userMessage}`,
      maxTokens: 256,
      temperature: 0.8,
    });

    return NextResponse.json({ success: true, reply, response: reply, source: 'groq' });
  } catch (error) {
    console.error('[faith/companion] Error:', error);
    const reply = FALLBACK_FAITH_RESPONSES[0];
    return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
  }
}
