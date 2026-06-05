import { NextRequest, NextResponse } from 'next/server';
import { generateChatTextWithFallback, type ChatMessage } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `You are SafeGround AI — a compassionate, culturally-aware recovery companion for Ethiopian university students.

You help students with:
- Khat addiction recovery support and relapse prevention
- Compulsive behavior and digital well-being
- Stress, anxiety, and academic pressure
- Faith-based and secular coping strategies
- Ethiopian cultural context (Ethiopian Orthodox, Protestant, Muslim traditions)

Guidelines:
- Always respond with warmth and non-judgmental support
- Keep responses concise (2-4 sentences, under 120 words)
- Never mention explicit content directly
- Use metaphors of strength, nature, academic focus, and Ethiopian heritage
- Suggest professional help when appropriate
- If the user mentions self-harm or crisis, encourage them to use the Panic Button or seek immediate help
- Be culturally respectful — acknowledge Ethiopian traditions and values`;

const fallbackReplies = [
  'I hear you. You are in a safe, anonymous space. Would you like to share more about what you are feeling right now?',
  'Thank you for trusting me. Every conversation is a step forward, and you have already taken the hardest step by reaching out.',
  'You are not alone in this. Many Ethiopian students face similar challenges, and there is strength in seeking support.',
  'Take a gentle breath. Healing is not about perfection — it is about showing up, just as you are doing right now.',
  'Your feelings are valid. In Ethiopian tradition, we say that the journey of a thousand miles begins with a single step. You have taken that step.',
  'Would you like to explore a grounding exercise together? It can help bring calm when thoughts feel overwhelming.',
  'What you are experiencing is part of the healing process. Recovery has ups and downs, and each day is a new opportunity.',
  'I am here to listen without judgment. Tell me what is on your mind, and we can work through it together.',
  'Remember that your ancestors' strength runs through your veins. You have the resilience to overcome this challenge.',
  'Sometimes the bravest thing we can do is ask for help. You are doing that right now, and that takes real courage.',
];

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
      systemPrompt: SYSTEM_PROMPT,
      messages: chatMessages,
      maxTokens: 300,
      temperature: 0.7,
      fallbacks: fallbackReplies,
    });

    return NextResponse.json({ success: true, reply, source });
  } catch (error) {
    console.error('[ai/chat] Error:', error);
    return NextResponse.json(
      { success: true, reply: fallbackReplies[0], source: 'fallback' },
      { status: 200 }
    );
  }
}
