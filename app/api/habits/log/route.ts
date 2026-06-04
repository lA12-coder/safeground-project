import { NextRequest, NextResponse } from 'next/server';

interface HabitLogRequest {
  mood: number;
  stress: number;
  urge: string;
  khatUsed: boolean;
  khatHoursAgo: number | null;
  alcoholUsed: boolean;
  triggers: string[];
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HabitLogRequest = await request.json();

    // Validate required fields
    if (!body.mood || !body.urge) {
      return NextResponse.json(
        { error: 'Missing required fields: mood, urge' },
        { status: 400 }
      );
    }

    // Create habit log entry
    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'anon-user-1', // Would come from session
      mood: body.mood,
      stress: body.stress,
      urge: body.urge,
      khatUsed: body.khatUsed,
      khatHoursAgo: body.khatHoursAgo,
      alcoholUsed: body.alcoholUsed,
      triggers: body.triggers,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    // TODO: Insert into Supabase database
    // const { data, error } = await supabase
    //   .from('habit_logs')
    //   .insert([logEntry]);

    // TODO: Update streak calculation
    // TODO: Check for khat risk window (4-9 hours after use)

    console.log('[v0] Habit log saved:', logEntry);

    return NextResponse.json({
      success: true,
      data: logEntry,
      message: 'Habit log saved successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('[v0] Error saving habit log:', error);
    return NextResponse.json(
      { error: 'Failed to save habit log' },
      { status: 500 }
    );
  }
}
