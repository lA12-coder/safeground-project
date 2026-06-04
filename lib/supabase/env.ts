/** Supabase project URL only — strips mistaken /rest/v1/ suffix from env. */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
