import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatEtb } from '@/lib/billing/currency';
import { MOCK_PROVIDERS, filterProviders } from '@/lib/directory/providers';
import { resolveProviderImageUrl } from '@/lib/directory/images';
import type { DirectoryProvider } from '@/lib/directory/types';

function extractDenomination(row: Record<string, unknown>): string | undefined {
  const slots = row.availability_slots as Record<string, unknown> | null;
  const fromSlots = slots?.faith_category ?? slots?.denomination;
  if (typeof fromSlots === 'string' && fromSlots) return fromSlots;
  const spec = String(row.specialization ?? '');
  if (/orthodox/i.test(spec)) return 'Orthodox';
  if (/protestant|evangelical/i.test(spec)) return 'Protestant';
  if (/muslim|islam/i.test(spec)) return 'Muslim';
  return undefined;
}

function mapDbProvider(row: Record<string, unknown>): DirectoryProvider {
  const type = String(row.type ?? 'clinical');
  const category =
    type === 'faith' || type === 'religious_org' || type === 'religious_individual'
      ? 'faith'
      : 'clinical';
  const fee = row.consultation_fee as number | null;
  const proBono = Boolean(row.pro_bono);

  return {
    id: String(row.id),
    name: String(row.name),
    orgName: row.org_name ? String(row.org_name) : undefined,
    category,
    providerType: type as DirectoryProvider['providerType'],
    typeLabel: type === 'religious_individual' ? 'SPIRITUAL TEACHER' : String(row.specialization ?? type),
    badge: row.is_verified ? 'verified' : 'faith',
    city: String(row.city ?? ''),
    languages: (row.languages as string[]) ?? [],
    bio: String(row.bio ?? ''),
    price: proBono ? 'Free (Pro bono)' : fee ? formatEtb(fee, { perSession: true }) : 'Contact',
    priceHighlight: proBono ? 'green' : 'amber',
    consultationFee: fee,
    mode: row.online && row.in_person ? 'hybrid' : row.online ? 'online' : 'in-person',
    modeLabel: row.online && row.in_person ? 'Hybrid' : row.online ? 'Online' : 'In-person',
    proBono,
    online: Boolean(row.online),
    inPerson: Boolean(row.in_person),
    verified: Boolean(row.is_verified),
    denomination: extractDenomination(row) as DirectoryProvider['denomination'],
    imageUrl: resolveProviderImageUrl(row.image_url as string | null),
    cta: type === 'religious_org' ? 'join' : 'book',
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

    if (type === 'faith') {
      query = query.in('type', ['religious_org', 'religious_individual']);
    } else if (type === 'clinical') {
      query = query.in('type', ['psychiatrist', 'counselor', 'clinical']);
    } else if (type) {
      query = query.eq('type', type);
    }
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
    const name = String(body.name || body.org_name || '').trim();
    const orgName = String(body.org_name || body.name || '').trim();
    const languages = Array.isArray(body.languages)
      ? body.languages.filter(Boolean)
      : String(body.languages || '')
        .split(',')
        .map((language) => language.trim())
        .filter(Boolean);

    if (!name || !orgName) {
      return NextResponse.json({ error: 'Organization name and contact name are required' }, { status: 400 });
    }

    const spiritualMeta: Record<string, unknown> = {}
    if (body.faith_category) spiritualMeta.faith_category = body.faith_category
    if (body.traditions?.length) spiritualMeta.traditions = body.traditions
    if (body.ministries?.length) spiritualMeta.ministries = body.ministries
    if (body.programs?.length) spiritualMeta.programs = body.programs
    if (body.mentors?.length) spiritualMeta.mentors = body.mentors

    const { data, error } = await supabase.from('providers').insert({
      name,
      org_name: orgName,
      type: body.type || 'ngo',
      specialization: body.specialization || body.faith_category || body.services?.join(', ') || body.bio?.slice(0, 100) || 'Community recovery support',
      city: body.city || '',
      region: body.region || 'Ethiopia',
      bio: body.bio || '',
      languages,
      consultation_fee: body.consultation_fee || null,
      pro_bono: body.pro_bono || false,
      online: body.online || false,
      in_person: body.in_person ?? true,
      availability_slots: Object.keys(spiritualMeta).length > 0 ? spiritualMeta : null,
      is_verified: false,
      is_active: false,
      email: body.email || body.contact_email || '',
      phone: body.phone || body.contact_phone || '',
    }).select('id, name, org_name, type, is_verified, is_active, email').single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, provider: data, message: 'Registration submitted for review' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[directory POST] Error:', error);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}
