import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('guardian_controls')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('[guardian/revoke]', error);
      return NextResponse.json({ error: 'Failed to revoke guardian' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Guardian access revoked' });
  } catch (error) {
    console.error('[guardian/revoke] Error:', error);
    return NextResponse.json({ error: 'Could not revoke guardian access.' }, { status: 500 });
  }
}
