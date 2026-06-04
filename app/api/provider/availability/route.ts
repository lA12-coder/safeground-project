import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SESSION_TYPES = ['initial', 'follow_up', 'crisis'] as const

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider, error } = await supabase
      .from('providers')
      .select('online, in_person, availability_slots, session_types')
      .eq('id', user.id)
      .single()

    if (error || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({
      online: provider.online,
      in_person: provider.in_person,
      session_types: provider.session_types || SESSION_TYPES,
      availability_slots: provider.availability_slots || null,
    })
  } catch (error) {
    console.error('[provider/availability] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const update: Record<string, any> = {}

    if (typeof body.online === 'boolean') update.online = body.online
    if (typeof body.in_person === 'boolean') update.in_person = body.in_person
    if (body.session_types) update.session_types = body.session_types
    if (body.availability_slots) update.availability_slots = body.availability_slots

    const { error } = await supabase
      .from('providers')
      .update(update)
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, ...update })
  } catch (error) {
    console.error('[provider/availability] Error:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}
