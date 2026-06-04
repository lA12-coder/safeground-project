import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Log panic alert - integrate with Supabase here
    console.log('[PANIC ALERT]', {
      timestamp: new Date().toISOString(),
      userId: body.userId || 'anonymous',
    });

    return NextResponse.json(
      { success: true, message: 'Panic alert logged' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Panic API error:', error);
    return NextResponse.json(
      { error: 'Failed to log panic alert' },
      { status: 500 }
    );
  }
}
