import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ totalUsers: 0 });
    }
    const supabase = createAdminClient();
    const { count: totalUsers, error: userErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userErr) {
      return NextResponse.json({ totalUsers: 0 });
    }

    return NextResponse.json({ totalUsers: totalUsers ?? 0 });
  } catch {
    return NextResponse.json({ totalUsers: 0 });
  }
}
