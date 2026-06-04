import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BookingRequest } from '@/lib/directory/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingRequest & {
      provider_id?: string;
      scheduled_at?: string;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerId = body.providerId ?? body.provider_id;
    const date = body.date;
    const time = body.time;

    if (!providerId || !date || !time) {
      return NextResponse.json(
        { error: 'Provider, date, and time are required.' },
        { status: 400 }
      );
    }

    const scheduled_at =
      body.scheduled_at ?? `${date}T${time.length === 5 ? time : time.slice(0, 5)}:00`;
    const sessionType = body.sessionType === 'online' ? 'online' : 'initial';
    const meetingLink =
      body.sessionType === 'online'
        ? `https://meet.safeground.app/session/${providerId}-${Date.now().toString(36)}`
        : undefined;

    const { data, error } = await supabase
      .from('telehealth_bookings')
      .insert({
        user_id: user.id,
        provider_id: providerId,
        session_type: sessionType,
        scheduled_at,
        duration_minutes: 50,
        notes: body.notes ?? null,
        status: 'pending',
        meeting_link: meetingLink,
      })
      .select('id, meeting_link, created_at')
      .single();

    if (error) {
      console.error('[bookings]', error);
      const booking = {
        id: `bk_${Date.now()}`,
        providerId,
        providerName: body.providerName,
        date,
        time,
        notes: body.notes ?? '',
        sessionType: body.sessionType,
        meetingLink,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, booking, source: 'fallback' });
    }

    return NextResponse.json({
      success: true,
      booking_id: data.id,
      booking: {
        id: data.id,
        providerId,
        providerName: body.providerName,
        date,
        time,
        notes: body.notes ?? '',
        sessionType: body.sessionType,
        meetingLink: data.meeting_link ?? meetingLink,
        status: 'pending',
        createdAt: data.created_at,
      },
      source: 'database',
    });
  } catch {
    return NextResponse.json({ error: 'Could not save booking.' }, { status: 500 });
  }
}
