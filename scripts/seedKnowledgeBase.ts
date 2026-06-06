/**
 * Seed the knowledge_base table with vector embeddings.
 * Run: npx tsx scripts/seedKnowledgeBase.ts
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { KNOWLEDGE_ENTRIES } from '../lib/ai/knowledgeBase';
import { generateEmbedding, isEmbeddingConfigured } from '../lib/ai/embeddings';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!isEmbeddingConfigured()) {
    console.error('Missing OPENAI_API_KEY (used for RAG embeddings)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  console.log(`Seeding ${KNOWLEDGE_ENTRIES.length} knowledge base entries...`);

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

      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`Error on entry ${i + 1}:`, err);
    }
  }

  console.log('\nDone! Knowledge base seeded successfully.');
  process.exit(0);
}

main();
