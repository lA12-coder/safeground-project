import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const RELATIONSHIP_MAP: Record<string, string> = {
  Parent: 'parent',
  Sibling: 'sibling',
  Spouse: 'spouse',
  Mentor: 'mentor',
  'Trusted Friend': 'trusted_friend',
};

const MONITORING_MAP: Record<string, string> = {
  'Alert Only': 'alert_only',
  'Weekly Summary': 'weekly_summary',
  'Full View': 'full_view',
};

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

    const guardian_alias =
      body.guardian_alias ?? body.alias ?? 'Guardian';
    const relationship =
      body.relationship && RELATIONSHIP_MAP[body.relationship]
        ? RELATIONSHIP_MAP[body.relationship]
        : (body.relationship ?? 'trusted_friend');
    const monitoring_level =
      body.monitoring_level ??
      (body.monitoringLevel ? MONITORING_MAP[body.monitoringLevel] : undefined) ??
      'alert_only';
    const notify_on_panic = body.notify_on_panic ?? body.notifyPanic ?? true;
    const notify_on_relapse = body.notify_on_relapse ?? body.notifyRelapse ?? false;
    const notify_streak_break = body.notify_streak_break ?? body.notifyStreakBreak ?? false;

    const { data: existing } = await supabase
      .from('guardian_controls')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active guardian link. Revoke it first to create a new one.' },
        { status: 409 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const access_url = `${appUrl}/guardian/${token}`;

    const { data, error } = await supabase
      .from('guardian_controls')
      .insert({
        user_id: user.id,
        guardian_alias,
        relationship,
        monitoring_level,
        notify_on_panic,
        notify_on_relapse,
        notify_streak_break,
        token,
        is_active: true,
      })
      .select('id, token, created_at')
      .single();

    if (error) {
      console.error('[guardian/create]', error);
      return NextResponse.json({ error: 'Failed to create guardian link' }, { status: 500 });
    }

    const shareText = `I'm working on something important for my wellbeing. I've given you a private link to support me: ${access_url}. Thank you.`;

    return NextResponse.json({
      success: true,
      token,
      access_url,
      url: access_url,
      shareText,
      guardian: {
        id: data.id,
        token: data.token,
        alias: guardian_alias,
        relationship,
        monitoringLevel: monitoring_level,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error('[guardian/create] Error:', error);
    return NextResponse.json({ error: 'Failed to create guardian link' }, { status: 500 });
  }
}
