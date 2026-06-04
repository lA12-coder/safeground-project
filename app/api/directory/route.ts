import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MOCK_PROVIDERS, filterProviders } from '@/lib/directory/providers';
import type { DirectoryProvider } from '@/lib/directory/types';

function mapDbProvider(row: Record<string, unknown>): DirectoryProvider {
  const type = String(row.type ?? 'clinical');
  const category = type === 'faith' || type === 'religious_org' ? 'faith' : 'clinical';
  return {
    id: String(row.id),
    name: String(row.name),
    category,
    providerType: type as DirectoryProvider['providerType'],
    typeLabel: String(row.specialization ?? type),
    badge: row.is_verified ? 'verified' : 'faith',
    city: String(row.city ?? ''),
    languages: (row.languages as string[]) ?? [],
    bio: String(row.bio ?? ''),
    price: row.pro_bono ? 'Pro bono' : row.consultation_fee ? `${row.consultation_fee} ETB` : 'Contact',
    priceHighlight: row.pro_bono ? 'green' : 'amber',
    mode: row.online && row.in_person ? 'hybrid' : row.online ? 'online' : 'in-person',
    modeLabel: row.online && row.in_person ? 'Hybrid' : row.online ? 'Online' : 'In-person',
    proBono: Boolean(row.pro_bono),
    online: Boolean(row.online),
    inPerson: Boolean(row.in_person),
    verified: Boolean(row.is_verified),
    imageUrl: '',
    cta: 'book',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get('type') ?? 'clinical';
  const city = searchParams.get('city');
  const language = searchParams.get('language');
  const online = searchParams.get('online') === 'true';
  const inPerson = searchParams.get('in_person') === 'true' || searchParams.get('inPerson') === 'true';
  const proBono = searchParams.get('pro_bono') === 'true' || searchParams.get('proBono') === 'true';
  const denomination = searchParams.get('denomination');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(12, Math.max(1, parseInt(searchParams.get('limit') ?? '3', 10)));

  try {
    const supabase = await createClient();
    let query = supabase.from('providers').select('*', { count: 'exact' }).eq('is_verified', true).eq('is_active', true);

    if (type) query = query.eq('type', type);
    if (city) query = query.ilike('city', `%${city}%`);
    if (language && language !== 'any') query = query.contains('languages', [language]);
    if (online) query = query.eq('online', true);
    if (proBono) query = query.eq('pro_bono', true);

    const from = (page - 1) * limit;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (!error && data && data.length > 0) {
      const total = count ?? data.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return NextResponse.json({
        providers: data.map((row) => mapDbProvider(row)),
        pagination: { page, limit, total, totalPages },
        total_pages: totalPages,
      });
    }
  } catch (e) {
    console.error('[directory] DB fallback to mock:', e);
  }

  const filtered = filterProviders(MOCK_PROVIDERS, {
    type,
    city: city ?? undefined,
    language: language ?? undefined,
    online,
    inPerson,
    proBono,
    denomination: denomination ?? undefined,
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const providers = filtered.slice(start, start + limit);

  return NextResponse.json({
    providers,
    pagination: { page, limit, total, totalPages },
    total_pages: totalPages,
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { error } = await supabase.from('providers').insert({
      name: body.name,
      org_name: body.org_name,
      type: body.type || 'ngo',
      specialization: body.bio?.slice(0, 100) || '',
      city: body.city || '',
      region: body.region || 'Ethiopia',
      bio: body.bio || '',
      languages: body.languages || [],
      consultation_fee: body.consultation_fee || null,
      pro_bono: body.pro_bono || false,
      online: body.online || false,
      in_person: body.in_person ?? true,
      is_verified: false,
      is_active: false,
      phone: '',
    });

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: 'Registration submitted for review' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[directory POST] Error:', error);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}
