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

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const typeFilter = searchParams.get('type')

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase.from('providers').select('*', { count: 'exact' })

    if (typeFilter) {
      const types = typeFilter.split(',').map(t => t.trim())
      query = query.in('type', types)
    }

    if (status === 'pending') {
      query = query.eq('is_verified', false).eq('is_active', false)
    } else if (status === 'verified') {
      query = query.eq('is_verified', true)
    } else if (status === 'rejected') {
      query = query.eq('is_verified', false).eq('is_active', true)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({ providers: data || [], total: count || 0, page })
  } catch (error) {
    console.error('[admin/providers] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}
