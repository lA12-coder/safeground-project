export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function getOpenRouterKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(getOpenRouterKey());
}

export async function generateChatText(options: {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const body: Record<string, unknown> = {
    model: process.env.AI_CHAT_MODEL ?? 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: options.systemPrompt },
      ...options.messages,
    ],
    max_tokens: options.maxTokens ?? 300,
    temperature: options.temperature ?? 0.7,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      'X-Title': 'SafeGround',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

export async function generateChatTextWithFallback(options: {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
  fallbacks: string[];
}): Promise<{ reply: string; source: 'openrouter' | 'gemini' | 'fallback' }> {
  if (isOpenRouterConfigured()) {
    try {
      const reply = await generateChatText(options);
      return { reply, source: 'openrouter' };
    } catch (err) {
      console.error('[openrouter] Primary call failed:', err);
    }
  }

  const { generateGeminiText, isGeminiConfigured } = await import('./gemini');
  if (isGeminiConfigured()) {
    try {
      const lastUserMsg = [...options.messages].reverse().find((m) => m.role === 'user');
      const history = options.messages.slice(0, -1);
      const reply = await generateGeminiText({
        systemPrompt: options.systemPrompt,
        userMessage: lastUserMsg?.content ?? '',
        history: history.length ? history : undefined,
        maxOutputTokens: options.maxTokens ?? 300,
        temperature: options.temperature ?? 0.7,
      });
      return { reply, source: 'gemini' };
    } catch (err) {
      console.error('[openrouter] Gemini fallback failed:', err);
    }
  }

  const reply = options.fallbacks[Math.floor(Math.random() * options.fallbacks.length)];
  return { reply, source: 'fallback' };
}
