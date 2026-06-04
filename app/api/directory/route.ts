import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const language = searchParams.get('language')
    const online = searchParams.get('online')
    const proBono = searchParams.get('pro_bono')
    const includeUnverified = searchParams.get('include_unverified') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })

    if (!includeUnverified) {
      query = query.eq('is_verified', true).eq('is_active', true)
    }

    if (type) query = query.eq('type', type)
    if (city) query = query.ilike('city', `%${city}%`)
    if (language) query = query.contains('languages', [language])
    if (online === 'true') query = query.eq('online', true)
    if (proBono === 'true') query = query.eq('pro_bono', true)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      providers: data || [],
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('[directory] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const body = await request.json()

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
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Registration submitted for review' }, { status: 201 })
  } catch (error) {
    console.error('[directory POST] Error:', error)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
