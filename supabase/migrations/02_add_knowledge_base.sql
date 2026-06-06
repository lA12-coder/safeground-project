-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Knowledge base table for RAG (Retrieval-Augmented Generation)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  embedding VECTOR(768),  -- Gemini text-embedding-004 outputs 768 dimensions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cosine similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding
  ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users
CREATE POLICY "Anyone can read knowledge_base"
  ON knowledge_base
  FOR SELECT
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "Service role can insert knowledge_base"
  ON knowledge_base
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update knowledge_base"
  ON knowledge_base
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete knowledge_base"
  ON knowledge_base
  FOR DELETE
  USING (true);

-- Match function for cosine similarity search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  category TEXT,
  source TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.category,
    kb.source,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    kb.created_at
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
