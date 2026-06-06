import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseUrl } from '@/lib/supabase/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractTextFromFile } from '@/lib/ai/textExtractor';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { chunkText } from '@/lib/ai/chunker';

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function isAdmin(user: { email?: string | null }): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  return !!user.email && adminEmails.includes(user.email.toLowerCase());
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string)?.trim() || 'uploaded';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use .txt, .pdf, or .docx' },
        { status: 400 }
      );
    }

    const { text, fileName } = await extractTextFromFile(file);

    if (!text.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the file' }, { status: 400 });
    }

    const chunks = chunkText(text);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No content chunks to process' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      try {
        const source = `${fileName} (part ${i + 1}/${chunks.length})`;
        const embedding = await generateEmbedding(chunks[i]);

        const { error } = await supabase.from('knowledge_base').insert({
          content: chunks[i],
          category,
          source,
          embedding,
        });

        if (error) {
          console.error('[knowledge/upload] Insert error:', error.message);
          failCount++;
        } else {
          successCount++;
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error('[knowledge/upload] Embedding error:', err);
        failCount++;
      }
    }

    if (successCount === 0) {
      return NextResponse.json({
        error: `File processed but 0 chunks were added. ${failCount} failed. Check that your embedding API key (Gemini or OpenAI) has available quota.`,
        details: 'Embedding generation failed. Ensure GEMINI_API_KEY or OPENAI_API_KEY has quota.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `File "${fileName}" processed: ${successCount} chunks added${failCount > 0 ? `, ${failCount} failed` : ''}`,
      chunks: successCount,
    });
  } catch (error) {
    console.error('[knowledge/upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
