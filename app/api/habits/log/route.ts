import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.habitType || !body.duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert habit log into Supabase - to be implemented
    console.log('[HABIT LOG]', body);

    return NextResponse.json(
      { success: true, message: 'Habit logged successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Habit log API error:', error);
    return NextResponse.json(
      { error: 'Failed to log habit' },
      { status: 500 }
    );
  }
}
