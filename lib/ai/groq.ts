const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export type GroqChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

export function isGroqRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('429') ||
    message.includes('rate_limit') ||
    message.includes('Rate limit') ||
    message.includes('quota')
  );
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
    model: DEFAULT_MODEL,
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

/** Single-turn or multi-turn chat with a final user message. */
export async function generateGroqSingleTurn(options: {
  systemPrompt: string;
  userMessage: string;
  history?: GroqChatTurn[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const messages: GroqChatTurn[] = [
    ...(options.history ?? []),
    { role: 'user', content: options.userMessage },
  ];
  return generateGroqText({
    systemPrompt: options.systemPrompt,
    messages,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });
}

export async function generateGroqJson<T>(options: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const jsonSystem = `${options.systemPrompt}\n\nRespond with valid JSON only. No markdown fences or extra text.`;
  const text = await generateGroqSingleTurn({
    systemPrompt: jsonSystem,
    userMessage: options.userMessage,
    maxTokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.5,
  });
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}
