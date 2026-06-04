import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the SafeGround Wisdom Companion — a faith-guided, multi-tradition spiritual guide for Ethiopian university students in recovery.

You honor Ethiopian Orthodox, Protestant, and Muslim traditions without favoring one over another unless the student specifies their path. You never shame, coerce, or replace professional clinical care.

Respond in 2-4 sentences. Use warm, poetic language. Stay under 200 tokens. If the user prefers Amharic, respond bilingually.`;

const FALLBACK_RESPONSES = [
  'What weighs on your soul today is seen. Take one breath, place your hand on your heart, and remember: you are held even when the path feels steep.',
  'The Light you seek is already near. Speak honestly to yourself tonight, and let one small act of kindness — toward yourself — be your prayer.',
  "Your recovery and your faith can walk together. Rest in this moment; tomorrow's strength will meet you when you rise.",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const user_context = body.user_context ?? {};

    const lastFromMessages = messages[messages.length - 1]?.content;
    const userMessage = message || lastFromMessages || 'Share wisdom with me.';

    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!isGeminiConfigured()) {
      const reply =
        FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
    }

    const { religion = 'none', language_pref = 'english' } = user_context;
    const contextInfo = `User's faith: ${religion}, Language preference: ${language_pref}`;

    const reply = await generateGeminiText({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: `${contextInfo}\n\nUser says: ${userMessage}`,
      maxOutputTokens: 256,
      temperature: 0.8,
    });

    return NextResponse.json({ success: true, reply, response: reply, source: 'gemini' });
  } catch (error) {
    console.error('[faith/companion] Error:', error);
    const reply = FALLBACK_RESPONSES[0];
    return NextResponse.json({ success: true, reply, response: reply, source: 'fallback' });
  }
}
