/**
 * Seed the knowledge_base table with vector embeddings.
 * Run: npx tsx scripts/seedKnowledgeBase.ts
 */
import { createClient } from '@supabase/supabase-js';
import { KNOWLEDGE_ENTRIES } from '../lib/ai/knowledgeBase';

const EMBEDDING_MODEL = 'text-embedding-004';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

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
    throw new Error(`Embedding ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.embedding?.values as number[];
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('Missing GEMINI_API_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  console.log(`Seeding ${KNOWLEDGE_ENTRIES.length} knowledge base entries...`);

  // Clear existing data
  await supabase.from('knowledge_base').delete().neq('id', 0);

  for (let i = 0; i < KNOWLEDGE_ENTRIES.length; i++) {
    const entry = KNOWLEDGE_ENTRIES[i];
    const text = entry.content;

    try {
      process.stdout.write(`[${i + 1}/${KNOWLEDGE_ENTRIES.length}] Generating embedding... `);
      const embedding = await generateEmbedding(text);
      process.stdout.write('done. Inserting... ');

      const { error } = await supabase.from('knowledge_base').insert({
        content: text,
        category: entry.category,
        source: entry.source,
        embedding,
      });

      if (error) {
        console.error(`Failed: ${error.message}`);
      } else {
        console.log('✓');
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`Error on entry ${i + 1}:`, err);
    }
  }

  console.log('\nDone! Knowledge base seeded successfully.');
  process.exit(0);
}

main();
