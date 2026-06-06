import { generateEmbedding } from '@/lib/ai/embeddings';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_CONTEXT_CHARS = 3000;
const SIMILARITY_THRESHOLD = 0.7;
const MAX_RESULTS = 5;

export type RagResult = {
  context: string;
  sources: { content: string; category: string }[];
};

export async function searchKnowledgeBase(query: string): Promise<RagResult> {
  try {
    const embedding = await generateEmbedding(query);

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: MAX_RESULTS,
    });

    if (error) {
      console.error('[rag] RPC error:', error);
      return { context: '', sources: [] };
    }

    const results = (data as { content: string; category: string; similarity: number }[]) ?? [];

    if (!results.length) {
      return { context: '', sources: [] };
    }

    let combined = '';
    const sources: { content: string; category: string }[] = [];

    for (const row of results) {
      const chunk = row.content.trim();
      if (!chunk) continue;

      const prefix = `[${row.category}] ${chunk}`;

      if (combined.length + prefix.length + 1 > MAX_CONTEXT_CHARS) break;

      combined += (combined ? '\n\n' : '') + prefix;
      sources.push({ content: chunk, category: row.category });
    }

    return { context: combined, sources };
  } catch (err) {
    console.error('[rag] search error:', err);
    return { context: '', sources: [] };
  }
}
