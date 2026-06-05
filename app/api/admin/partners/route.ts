import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = request.nextUrl.searchParams.get('status') || 'all'
    let query = supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (status === 'pending') query = query.eq('is_verified', false)
    if (status === 'verified') query = query.eq('is_verified', true)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({
      partners: data || [],
      counts: {
        all: data?.length || 0,
        pending: data?.filter(partner => !partner.is_verified).length || 0,
        verified: data?.filter(partner => partner.is_verified).length || 0,
      },
    })
  } catch (error) {
    console.error('[admin/partners] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase.from('providers').insert({
      name: body.name,
      org_name: body.org_name || body.name,
      type: body.type || 'ngo',
      specialization: body.specialization || 'Partnership',
      city: body.city || 'Addis Abeba',
      region: body.region || 'Ethiopia',
      bio: body.bio || '',
      languages: body.languages || ['English'],
      consultation_fee: null,
      pro_bono: true,
      online: body.online ?? true,
      in_person: body.in_person ?? true,
      is_verified: true,
      is_active: true,
      phone: body.phone || '',
    }).select().single()

    if (error) throw error

    return NextResponse.json({ partner: data, success: true }, { status: 201 })
  } catch (error) {
    console.error('[admin/partners POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}
