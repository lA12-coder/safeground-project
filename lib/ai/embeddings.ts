const GEMINI_EMBEDDING_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
/** Matches knowledge_base VECTOR(768) in Supabase. */
const EMBEDDING_DIMENSIONS = 768;

export function isEmbeddingConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const res = await fetch(`${GEMINI_EMBEDDING_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.embedding?.values as number[];
      }

      console.warn('[embeddings] Gemini failed, falling back to OpenAI:', res.status);
    } catch (err) {
      console.warn('[embeddings] Gemini error, falling back to OpenAI:', err);
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('No AI embedding service available. Configure GEMINI_API_KEY or OPENAI_API_KEY.');
  }

  const res = await fetch(OPENAI_EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    throw new Error(`OpenAI embedding ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data?.[0]?.embedding as number[];
}
