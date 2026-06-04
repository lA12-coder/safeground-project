import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createGuardianLink, getGuardianForUser } from '@/lib/guardian/store';
import { guardianShareText, guardianShareUrl } from '@/lib/guardian/share';
import type { CreateGuardianPayload } from '@/lib/guardian/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sign in to create a guardian link.' }, { status: 401 });
    }

    const body = (await request.json()) as CreateGuardianPayload;

    if (!body.alias?.trim() || !body.relationship || !body.monitoringLevel) {
      return NextResponse.json({ error: 'Alias, relationship, and monitoring level are required.' }, { status: 400 });
    }

    const existing = await getGuardianForUser(user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active guardian link. Revoke it first to create a new one.' },
        { status: 409 }
      );
    }

    const link = await createGuardianLink(user.id, body);
    const url = guardianShareUrl(link.token);

    return NextResponse.json({
      success: true,
      guardian: link,
      url,
      shareText: guardianShareText(url),
    });
  } catch (error) {
    console.error('[guardian/create]', error);
    return NextResponse.json({ error: 'Could not create guardian link.' }, { status: 500 });
  }
}
