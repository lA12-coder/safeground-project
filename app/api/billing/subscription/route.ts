import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAiAccess } from '@/lib/billing/ai-access';
import {
  AI_PLUS_BILLING_DAYS,
  AI_PLUS_PLAN,
  AI_PLUS_PRICE_ETB,
} from '@/lib/billing/constants';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await getAiAccess(supabase, user.id);

    return NextResponse.json({
      plan: access.plan,
      is_subscribed: access.isSubscribed,
      ai_requests_used: access.aiRequestsUsed,
      ai_requests_limit: access.aiRequestsLimit,
      remaining: access.remaining,
      subscription_expires_at: access.subscriptionExpiresAt,
      ai_plus_price_etb: AI_PLUS_PRICE_ETB,
      features: {
        free: `${access.aiRequestsLimit} AI assistant requests to try`,
        ai_plus: 'Unlimited AI assistant, affirmations & faith companion',
      },
    });
  } catch (error) {
    console.error('[billing/subscription GET]', error);
    return NextResponse.json({ error: 'Failed to load subscription' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = body.plan ?? AI_PLUS_PLAN;

    if (plan !== AI_PLUS_PLAN) {
      return NextResponse.json({ error: 'Unsupported plan' }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AI_PLUS_BILLING_DAYS);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: AI_PLUS_PLAN,
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('[billing/subscription POST]', error);
      return NextResponse.json({ error: 'Could not activate subscription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      plan: AI_PLUS_PLAN,
      amount_etb: AI_PLUS_PRICE_ETB,
      subscription_expires_at: expiresAt.toISOString(),
      message: 'AI Plus activated (demo payment simulated).',
    });
  } catch (error) {
    console.error('[billing/subscription POST]', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
