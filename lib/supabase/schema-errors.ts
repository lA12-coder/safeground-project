/** True when PostgREST reports a table is absent from the schema cache. */
export function isMissingSupabaseTable(error: unknown): boolean {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  return (
    code === 'PGRST205' ||
    message.includes('PGRST205') ||
    message.includes('schema cache') ||
    message.includes('Could not find the table')
  );
}

/** True when a referenced column does not exist (schema drift). */
export function isMissingSupabaseColumn(error: unknown): boolean {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  return (
    code === '42703' ||
    code === 'PGRST204' ||
    message.includes('PGRST204') ||
    message.includes('does not exist') ||
    (message.includes('Could not find the') && message.includes('column'))
  );
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    return code != null ? String(code) : undefined;
  }
  return undefined;
}
