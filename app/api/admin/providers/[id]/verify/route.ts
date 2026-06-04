import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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

    const { verified } = await request.json()

    const { error } = await supabase
      .from('providers')
      .update({
        is_verified: verified ?? true,
        is_active: verified ?? true,
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: verified ? 'Provider verified' : 'Provider rejected' })
  } catch (error) {
    console.error('[admin/providers/verify] Error:', error)
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}
