import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseUrl } from '@/lib/supabase/env';
import { createAdminClient } from '@/lib/supabase/admin';

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

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '50');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const supabase = createAdminClient();
  let query = supabase
    .from('knowledge_base')
    .select('id, content, category, source, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('content', `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    console.error('[admin/knowledge] GET error:', error);
    if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
      return NextResponse.json({ data: [], total: 0, tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0 });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('knowledge_base').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
