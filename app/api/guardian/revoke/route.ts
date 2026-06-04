import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeGuardianLink } from '@/lib/guardian/store';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const linkId = String(body.linkId ?? '');

    if (!linkId) {
      return NextResponse.json({ error: 'linkId is required.' }, { status: 400 });
    }

    const ok = await revokeGuardianLink(user.id, linkId);

    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('[guardian/revoke]', error);
    return NextResponse.json({ error: 'Could not revoke guardian access.' }, { status: 500 });
  }
}
