import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { KNOWLEDGE_ENTRIES } from '@/lib/ai/knowledgeBase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.ADMIN_SECRET_KEY;

    if (secret && authHeader !== `Bearer ${secret}`) {
      const supabase = createAdminClient();
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
        if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createAdminClient();

    await supabase.from('knowledge_base').delete().neq('id', 0);

    let successCount = 0;
    let failCount = 0;

    for (const entry of KNOWLEDGE_ENTRIES) {
      try {
        const embedding = await generateEmbedding(entry.content);
        const { error } = await supabase.from('knowledge_base').insert({
          content: entry.content,
          category: entry.category,
          source: entry.source,
          embedding,
        });
        if (error) {
          console.error('[seed-knowledge] Insert error:', error.message);
          failCount++;
        } else {
          successCount++;
        }
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error('[seed-knowledge] Embedding error:', err);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Knowledge base seeded: ${successCount} inserted, ${failCount} failed`,
      total: KNOWLEDGE_ENTRIES.length,
    });
  } catch (error) {
    console.error('[seed-knowledge] Error:', error);
    return NextResponse.json({ error: 'Failed to seed knowledge base' }, { status: 500 });
  }
}
