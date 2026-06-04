import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Would come from session in production
    const userId = request.nextUrl.searchParams.get('userId') || 'anon-user-1';

    // TODO: Fetch from Supabase
    // const { data, error } = await supabase
    //   .from('streaks')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .single();

    // Mock data for now
    const streakData = {
      currentStreak: 7,
      longestStreak: 14,
      totalCleanDays: 21,
      lastLoggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[v0] Fetched streak data for user:', userId);

    return NextResponse.json(streakData);
  } catch (error) {
    console.error('[v0] Streak API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}
