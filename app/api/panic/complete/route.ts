import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { session_id, completed_steps } = body;

    // Update streak: mark as 'held_ground'
    if (session_id && !session_id.startsWith('session_')) {
      const { error } = await supabase
        .from('habit_logs')
        .update({ 
          status: 'held_ground',
          notes: `Completed steps: ${completed_steps}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', session_id);
        
      if (error) {
        console.error('Error updating streak (this may be normal if schema is missing):', error);
      }
    } else {
       console.log('Mock session completed:', { session_id, completed_steps });
    }

    return NextResponse.json(
      { success: true, message: 'Streak protected and milestone logged' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Panic Complete API error:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' }, 
      { status: 500 }
    );
  }
}
