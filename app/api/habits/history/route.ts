import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isMissingSupabaseTable } from '@/lib/supabase/schema-errors'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: true })

    if (error) {
      if (isMissingSupabaseTable(error)) {
        return NextResponse.json([], {
          headers: { 'X-SafeGround-Setup': 'habit_logs' },
        })
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    if (isMissingSupabaseTable(error)) {
      return NextResponse.json([])
    }
    console.error('[habits/history] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
