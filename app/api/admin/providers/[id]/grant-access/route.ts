import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < 14; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
  return pw + '!A1'
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user: adminUser } } = await adminSupabase.auth.getUser()
    if (!adminUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    if (!adminEmails.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: provider, error: fetchError } = await adminSupabase
      .from('providers')
      .select('id, name, email, user_id, org_name')
      .eq('id', id)
      .single()

    if (fetchError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    if (provider.user_id) {
      return NextResponse.json({ error: 'Access already granted', user_id: provider.user_id }, { status: 409 })
    }

    const email = provider.email
    if (!email) {
      return NextResponse.json({ error: 'No email on record. Ask the org to re-register with an email.' }, { status: 400 })
    }

    const password = generatePassword()

    const { data: authData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { alias: provider.org_name || provider.name, role: 'org' },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = authData.user.id

    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: userId,
      alias: (provider.org_name || provider.name).replace(/\s+/g, '-').toLowerCase().slice(0, 30),
      language_pref: 'en',
      support_preference: 'faith',
      onboarding_done: true,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('[grant-access] Profile upsert error:', profileError)
    }

    const { error: updateError } = await adminSupabase
      .from('providers')
      .update({ user_id: userId, is_active: true })
      .eq('id', id)

    if (updateError) {
      console.error('[grant-access] Provider update error:', updateError)
      return NextResponse.json({ error: 'Failed to link user to provider' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      email,
      password,
      user_id: userId,
      message: 'Access granted. Share the password with the organization admin.',
    })
  } catch (error) {
    console.error('[grant-access] Error:', error)
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
  }
}
