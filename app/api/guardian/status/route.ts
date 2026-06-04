import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGuardianForUser } from '@/lib/guardian/store';
import { guardianShareUrl } from '@/lib/guardian/share';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ guardian: null }, { status: 200 });
    }

    const guardian = await getGuardianForUser(user.id);

    if (!guardian) {
      return NextResponse.json({ guardian: null });
    }

    return NextResponse.json({
      guardian,
      url: guardianShareUrl(guardian.token),
    });
  } catch (error) {
    console.error('[guardian/status]', error);
    return NextResponse.json({ guardian: null });
  }
}
