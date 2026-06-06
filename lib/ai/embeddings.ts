const EMBEDDING_MODEL = 'text-embedding-004';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY for embeddings');
  }

  const url = `${API_BASE}/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    throw new Error(`Gemini embedding ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.embedding?.values as number[];
}
