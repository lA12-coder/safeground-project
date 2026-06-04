import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch streak data from Supabase - to be implemented
    const streakData = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastLoggedAt: null,
    };

    return NextResponse.json(streakData);
  } catch (error) {
    console.error('Streak API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}
