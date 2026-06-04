import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_ECHO_QUOTES } from '@/lib/guest/constants';

function isMissingTable(message: string): boolean {
  return (
    message.includes('anonymous_chat') ||
    message.includes('schema cache') ||
    message.includes('PGRST205')
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('anonymous_chat')
      .select('id, content, alias, created_at')
      .eq('message_type', 'milestone_share')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      if (isMissingTable(error.message)) {
        return NextResponse.json({
          quotes: FALLBACK_ECHO_QUOTES,
          source: 'fallback',
          setupRequired: true,
        });
      }
      throw error;
    }

    const quotes =
      data && data.length > 0
        ? data.slice(0, 2).map((row) => ({
            id: String(row.id),
            content: String(row.content),
            alias: String(row.alias),
          }))
        : FALLBACK_ECHO_QUOTES;

    return NextResponse.json({ quotes, source: 'database', setupRequired: false });
  } catch (error) {
    console.error('[guest/echoes]', error);
    return NextResponse.json({
      quotes: FALLBACK_ECHO_QUOTES,
      source: 'fallback',
      setupRequired: true,
    });
  }
}
