export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export function getOpenAIKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(getOpenAIKey());
}

export async function generateChatText(options: {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const body: Record<string, unknown> = {
    model: process.env.AI_CHAT_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: options.systemPrompt },
      ...options.messages,
    ],
    max_tokens: options.maxTokens ?? 300,
    temperature: options.temperature ?? 0.7,
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`OpenAI ${res.status}: ${errText}`);
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
}): Promise<{ reply: string; source: 'openai' | 'gemini' | 'fallback' }> {
  if (isOpenAIConfigured()) {
    try {
      const reply = await generateChatText(options);
      return { reply, source: 'openai' };
    } catch (err) {
      console.error('[openai] Primary call failed:', err);
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
      console.error('[openai] Gemini fallback failed:', err);
    }
  }

  const reply = options.fallbacks[Math.floor(Math.random() * options.fallbacks.length)];
  return { reply, source: 'fallback' };
}
