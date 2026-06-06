/** True when PostgREST reports a table is absent from the schema cache. */
export function isMissingSupabaseTable(error: unknown): boolean {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

  return (
    message.includes('PGRST205') ||
    message.includes('schema cache') ||
    message.includes('Could not find the table')
  );
}
