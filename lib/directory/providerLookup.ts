import { MOCK_PROVIDERS } from '@/lib/directory/providers';

export function resolveProviderName(
  providerId: string,
  dbName?: string | null,
  fallbackName?: string | null
): string {
  if (fallbackName?.trim()) return fallbackName.trim();
  if (dbName?.trim()) return dbName.trim();
  const mock = MOCK_PROVIDERS.find((p) => p.id === providerId);
  return mock?.name ?? 'Provider';
}
