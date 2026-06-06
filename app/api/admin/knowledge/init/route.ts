import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '').replace(/\/$/, '');

    const sql = `
      CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

      CREATE TABLE IF NOT EXISTS knowledge_base (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        source TEXT,
        embedding VECTOR(768),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding
        ON knowledge_base
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);

      ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Anyone can read knowledge_base" ON knowledge_base;
      CREATE POLICY "Anyone can read knowledge_base"
        ON knowledge_base FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Service role can insert knowledge_base" ON knowledge_base;
      CREATE POLICY "Service role can insert knowledge_base"
        ON knowledge_base FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Service role can update knowledge_base" ON knowledge_base;
      CREATE POLICY "Service role can update knowledge_base"
        ON knowledge_base FOR UPDATE USING (true);

      DROP POLICY IF EXISTS "Service role can delete knowledge_base" ON knowledge_base;
      CREATE POLICY "Service role can delete knowledge_base"
        ON knowledge_base FOR DELETE USING (true);

      CREATE OR REPLACE FUNCTION match_knowledge_base(
        query_embedding VECTOR(768),
        match_threshold FLOAT,
        match_count INT
      )
      RETURNS TABLE (
        id BIGINT, content TEXT, category TEXT, source TEXT,
        similarity FLOAT, created_at TIMESTAMPTZ
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT kb.id, kb.content, kb.category, kb.source,
          1 - (kb.embedding <=> query_embedding) AS similarity, kb.created_at
        FROM knowledge_base kb
        WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
        ORDER BY kb.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `;

    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    const body = res.ok ? null : await res.text().catch(() => '');
    console.log('[knowledge/init] API response:', res.status, body);

    if (!res.ok) {
      return NextResponse.json({
        error: `Management API returned ${res.status}`,
        details: body,
        hint: 'Run the SQL in supabase/migrations/02_add_knowledge_base.sql via Supabase SQL Editor',
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Knowledge base schema initialized' });
  } catch (error) {
    console.error('[knowledge/init] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Initialization failed',
      hint: 'Run the SQL in supabase/migrations/02_add_knowledge_base.sql via Supabase SQL Editor',
    }, { status: 500 });
  }
}
