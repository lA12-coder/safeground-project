const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

export async function generateGroqText(options: {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error('Missing GROQ_API_KEY');

  const body = {
    model: process.env.GROQ_MODEL ?? 'llama3-70b-8192',
    messages: [
      { role: 'system', content: options.systemPrompt },
      ...options.messages,
    ],
    max_tokens: options.maxTokens ?? 300,
    temperature: options.temperature ?? 0.7,
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Groq ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}
