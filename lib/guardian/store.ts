import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import type { CreateGuardianPayload, GuardianLink } from './types';

export { guardianShareText, guardianShareUrl } from './share';

const memoryByUser = new Map<string, GuardianLink>();

function isMissingTableError(message: string): boolean {
  return (
    message.includes('guardian_links') ||
    message.includes('schema cache') ||
    message.includes('PGRST205')
  );
}

function buildToken(): string {
  return randomBytes(16).toString('hex');
}

function toRecord(row: Record<string, unknown>): GuardianLink {
  return {
    id: String(row.id),
    alias: String(row.alias),
    relationship: row.relationship as GuardianLink['relationship'],
    monitoringLevel: row.monitoring_level as GuardianLink['monitoringLevel'],
    notifyPanic: Boolean(row.notify_panic),
    notifyRelapse: Boolean(row.notify_relapse),
    notifyStreakBreak: Boolean(row.notify_streak_break),
    token: String(row.token),
    createdAt: String(row.created_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
  };
}

export async function getGuardianForUser(userId: string): Promise<GuardianLink | null> {
  const memory = memoryByUser.get(userId);
  if (memory && !memory.revokedAt) return memory;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('guardian_links')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) return memory ?? null;
    throw error;
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
  const token = buildToken();
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
  const { data, error } = await supabase
    .from('guardian_links')
    .insert({
      user_id: userId,
      alias: record.alias,
      relationship: record.relationship,
      monitoring_level: record.monitoringLevel,
      notify_panic: record.notifyPanic,
      notify_relapse: record.notifyRelapse,
      notify_streak_break: record.notifyStreakBreak,
      token: record.token,
    })
    .select('*')
    .single();

  if (error) {
    if (isMissingTableError(error.message)) {
      memoryByUser.set(userId, record);
      return record;
    }
    throw error;
  }

  const link = toRecord(data as Record<string, unknown>);
  memoryByUser.set(userId, link);
  return link;
}

export async function revokeGuardianLink(userId: string, linkId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('guardian_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error && !isMissingTableError(error.message)) {
    throw error;
  }

  const memory = memoryByUser.get(userId);
  if (memory && (memory.id === linkId || error)) {
    memory.revokedAt = new Date().toISOString();
    memoryByUser.delete(userId);
    return true;
  }

  return !error;
}
