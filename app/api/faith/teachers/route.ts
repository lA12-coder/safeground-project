import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatEtb } from '@/lib/billing/currency';
import { MOCK_PROVIDERS, filterProviders } from '@/lib/directory/providers';
import { resolveProviderImageUrl } from '@/lib/directory/images';
import type { DirectoryProvider } from '@/lib/directory/types';
import { religionToDenomination } from '@/lib/faith/constants';

function extractDenomination(row: Record<string, unknown>): string | undefined {
  const slots = row.availability_slots as Record<string, unknown> | null;
  const fromSlots = slots?.faith_category ?? slots?.denomination;
  if (typeof fromSlots === 'string' && fromSlots) return fromSlots;

  const spec = String(row.specialization ?? '');
  if (/orthodox/i.test(spec)) return 'Orthodox';
  if (/protestant|evangelical/i.test(spec)) return 'Protestant';
  if (/muslim|islam/i.test(spec)) return 'Muslim';
  if (/catholic/i.test(spec)) return 'Catholic';
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

/** Verified spiritual teachers from the user's faith tradition. */
export async function GET(request: NextRequest) {
  const religion = request.nextUrl.searchParams.get('religion');
  const denomination =
    request.nextUrl.searchParams.get('denomination') ?? religionToDenomination(religion ?? undefined);

  try {
    const supabase = await createClient();
    let query = supabase
      .from('providers')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true)
      .eq('type', 'religious_individual');

    const { data, error } = await query.order('rating', { ascending: false }).limit(20);

    if (!error && data && data.length > 0) {
      let teachers = data.map((row) => mapDbProvider(row));
      if (denomination && denomination !== 'all') {
        teachers = teachers.filter(
          (t) => !t.denomination || t.denomination.toLowerCase() === denomination.toLowerCase()
        );
      }
      return NextResponse.json({ teachers, source: 'database' });
    }
  } catch (e) {
    console.error('[faith/teachers]', e);
  }

  let teachers = filterProviders(MOCK_PROVIDERS, {
    type: 'faith',
    denomination: denomination ?? undefined,
  }).filter((p) => p.providerType === 'religious_individual' && p.verified);

  if (!teachers.length) {
    teachers = MOCK_PROVIDERS.filter(
      (p) => p.category === 'faith' && p.providerType === 'religious_individual' && p.verified
    );
  }

  return NextResponse.json({ teachers, source: 'mock' });
}
