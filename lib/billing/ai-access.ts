import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AI_PLUS_PLAN,
  FREE_AI_REQUEST_LIMIT,
  FREE_PLAN,
  type SubscriptionPlan,
} from '@/lib/billing/constants';

export type AiAccessStatus = {
  plan: SubscriptionPlan;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  remaining: number | null;
  isSubscribed: boolean;
  allowed: boolean;
  subscriptionExpiresAt: string | null;
};

function isActiveSubscription(
  plan: string | null | undefined,
  expiresAt: string | null | undefined
): boolean {
  if (plan !== AI_PLUS_PLAN) return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export async function getAiAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<AiAccessStatus> {
  const { data } = await supabase
    .from('profiles')
    .select('subscription_plan, ai_requests_used, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle();

  const plan = (data?.subscription_plan as SubscriptionPlan) ?? FREE_PLAN;
  const used = data?.ai_requests_used ?? 0;
  const expiresAt = data?.subscription_expires_at ?? null;
  const isSubscribed = isActiveSubscription(plan, expiresAt);
  const allowed = isSubscribed || used < FREE_AI_REQUEST_LIMIT;

  return {
    plan,
    aiRequestsUsed: used,
    aiRequestsLimit: FREE_AI_REQUEST_LIMIT,
    remaining: isSubscribed ? null : Math.max(0, FREE_AI_REQUEST_LIMIT - used),
    isSubscribed,
    allowed,
    subscriptionExpiresAt: expiresAt,
  };
}

export async function consumeAiRequest(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: boolean; access: AiAccessStatus }> {
  const access = await getAiAccess(supabase, userId);
  if (!access.allowed) {
    return { ok: false, access };
  }

  if (access.isSubscribed) {
    return { ok: true, access };
  }

  const nextUsed = access.aiRequestsUsed + 1;
  await supabase
    .from('profiles')
    .update({
      ai_requests_used: nextUsed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return {
    ok: true,
    access: {
      ...access,
      aiRequestsUsed: nextUsed,
      remaining: Math.max(0, FREE_AI_REQUEST_LIMIT - nextUsed),
      allowed: nextUsed < FREE_AI_REQUEST_LIMIT,
    },
  };
}

export function aiLimitResponse(access: AiAccessStatus) {
  return {
    error: 'AI trial limit reached. Upgrade to AI Plus for unlimited assistant access.',
    code: 'AI_LIMIT_REACHED',
    upgrade_url: '/settings/subscription',
    ai_requests_used: access.aiRequestsUsed,
    ai_requests_limit: access.aiRequestsLimit,
    plan: access.plan,
  };
}
