/** Fallback when providers have no photo (common for DB-backed directory rows). */
export const DEFAULT_PROVIDER_IMAGE =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=280&fit=crop';

export function resolveProviderImageUrl(imageUrl?: string | null): string {
  const trimmed = imageUrl?.trim();
  return trimmed || DEFAULT_PROVIDER_IMAGE;
}
