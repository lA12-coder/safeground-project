import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText, isGeminiConfigured } from '@/lib/ai/gemini';

const SYSTEM_PROMPT = `You are the SafeGround Wisdom Companion — a faith-guided, multi-tradition spiritual guide for Ethiopian university students in recovery.

You honor Ethiopian Orthodox, Protestant, and Muslim traditions without favoring one over another unless the student specifies their path. You never shame, coerce, or replace professional clinical care.

Respond in 2-4 sentences. Use warm, poetic language. You may include one short scripture-inspired line when appropriate. Stay under 200 tokens. If the student shares a burden, offer comfort and a gentle next step (prayer, reflection, community, or rest).`;

const FALLBACK_RESPONSES = [
  'What weighs on your soul today is seen. Take one breath, place your hand on your heart, and remember: you are held even when the path feels steep.',
  'The Light you seek is already near. Speak honestly to yourself tonight, and let one small act of kindness — toward yourself — be your prayer.',
  "Your recovery and your faith can walk together. Rest in this moment; tomorrow's strength will meet you when you rise.",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!isGeminiConfigured()) {
      const reply =
        FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ success: true, reply, source: 'fallback' });
    }

    const reply = await generateGeminiText({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: message,
      maxOutputTokens: 256,
      temperature: 0.8,
    });

    return NextResponse.json({ success: true, reply, source: 'gemini' });
  } catch (error) {
    console.error('[faith/companion]', error);
    const reply = FALLBACK_RESPONSES[0];
    return NextResponse.json({ success: true, reply, source: 'fallback' });
  }
}
