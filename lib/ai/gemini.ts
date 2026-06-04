import { GoogleGenerativeAI, type Content } from '@google/generative-ai';

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

export type GeminiChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export async function generateGeminiText(options: {
  systemPrompt: string;
  userMessage: string;
  history?: GeminiChatTurn[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 256,
      temperature: options.temperature ?? 0.7,
    },
  });

  const history: Content[] | undefined = options.history?.length
    ? options.history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
    : undefined;

  if (history?.length) {
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(options.userMessage);
    return result.response.text().trim();
  }

  const result = await model.generateContent(options.userMessage);
  return result.response.text().trim();
}

export async function generateGeminiJson<T>(options: {
  systemPrompt: string;
  userMessage: string;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<T> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 1024,
      temperature: options.temperature ?? 0.5,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(options.userMessage);
  const text = result.response.text().trim();
  return JSON.parse(text) as T;
}
