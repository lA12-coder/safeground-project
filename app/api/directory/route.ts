import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROVIDERS, filterProviders } from '@/lib/directory/providers';

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

  const filtered = filterProviders(MOCK_PROVIDERS, {
    type,
    city,
    language,
    online,
    inPerson,
    proBono,
    denomination,
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const providers = filtered.slice(start, start + limit);

  return NextResponse.json({
    providers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
