import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import type { CreateGuardianPayload, GuardianLink } from './types';

export { guardianShareText, guardianShareUrl } from './share';

const memoryByUser = new Map<string, GuardianLink>();

const RELATIONSHIP_FROM_DB: Record<string, GuardianLink['relationship']> = {
  parent: 'Parent',
  sibling: 'Sibling',
  spouse: 'Spouse',
  mentor: 'Mentor',
  trusted_friend: 'Trusted Friend',
};

const MONITORING_FROM_DB: Record<string, GuardianLink['monitoringLevel']> = {
  alert_only: 'Alert Only',
  weekly_summary: 'Weekly Summary',
  full_view: 'Full View',
};

function toRecord(row: Record<string, unknown>): GuardianLink {
  const rel = String(row.relationship ?? 'trusted_friend');
  const mon = String(row.monitoring_level ?? 'alert_only');
  return {
    id: String(row.id),
    alias: String(row.guardian_alias ?? row.alias ?? 'Guardian'),
    relationship: RELATIONSHIP_FROM_DB[rel] ?? 'Trusted Friend',
    monitoringLevel: MONITORING_FROM_DB[mon] ?? 'Alert Only',
    notifyPanic: Boolean(row.notify_on_panic ?? row.notify_panic),
    notifyRelapse: Boolean(row.notify_on_relapse ?? row.notify_relapse),
    notifyStreakBreak: Boolean(row.notify_streak_break ?? row.notify_streak_break),
    token: String(row.token),
    createdAt: String(row.created_at),
    revokedAt: row.is_active === false ? String(row.updated_at ?? new Date().toISOString()) : null,
  };
}

export async function getGuardianForUser(userId: string): Promise<GuardianLink | null> {
  const memory = memoryByUser.get(userId);
  if (memory && !memory.revokedAt) return memory;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('guardian_controls')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[guardian/store] getGuardianForUser:', error);
    return memory ?? null;
  }
  if (!data) return null;
  const link = toRecord(data as Record<string, unknown>);
  memoryByUser.set(userId, link);
  return link;
}

export async function createGuardianLink(
  userId: string,
  payload: CreateGuardianPayload
): Promise<GuardianLink> {
  const token = randomBytes(16).toString('hex');
  const record: GuardianLink = {
    id: `mem_${Date.now()}`,
    alias: payload.alias.trim(),
    relationship: payload.relationship,
    monitoringLevel: payload.monitoringLevel,
    notifyPanic: payload.notifyPanic ?? true,
    notifyRelapse: payload.notifyRelapse ?? false,
    notifyStreakBreak: payload.notifyStreakBreak ?? false,
    token,
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };

  const supabase = await createClient();
  const relMap: Record<string, string> = {
    Parent: 'parent',
    Sibling: 'sibling',
    Spouse: 'spouse',
    Mentor: 'mentor',
    'Trusted Friend': 'trusted_friend',
  };
  const monMap: Record<string, string> = {
    'Alert Only': 'alert_only',
    'Weekly Summary': 'weekly_summary',
    'Full View': 'full_view',
  };

  const { data, error } = await supabase
    .from('guardian_controls')
    .insert({
      user_id: userId,
      guardian_alias: record.alias,
      relationship: relMap[record.relationship] ?? 'trusted_friend',
      monitoring_level: monMap[record.monitoringLevel] ?? 'alert_only',
      notify_on_panic: record.notifyPanic,
      notify_on_relapse: record.notifyRelapse,
      notify_streak_break: record.notifyStreakBreak,
      token: record.token,
      is_active: true,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[guardian/store] createGuardianLink:', error);
    memoryByUser.set(userId, record);
    return record;
  }

  const link = toRecord(data as Record<string, unknown>);
  memoryByUser.set(userId, link);
  return link;
}

export async function revokeGuardianLink(userId: string, linkId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('guardian_controls')
    .update({ is_active: false })
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) {
    console.error('[guardian/store] revokeGuardianLink:', error);
  }

  memoryByUser.delete(userId);
  return !error;
}
