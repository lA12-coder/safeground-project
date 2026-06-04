import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BookingRequest } from '@/lib/directory/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingRequest;

    if (!body.providerId || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Provider, date, and time are required.' },
        { status: 400 }
      );
    }

    const meetingLink =
      body.sessionType === 'online'
        ? `https://meet.safeground.app/session/${body.providerId}-${Date.now().toString(36)}`
        : undefined;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user?.id ?? null,
        provider_id: body.providerId,
        provider_name: body.providerName,
        booking_date: body.date,
        booking_time: body.time,
        notes: body.notes ?? '',
        session_type: body.sessionType,
        meeting_link: meetingLink,
        status: 'confirmed',
      })
      .select('id, meeting_link, created_at')
      .single();

    if (error) {
      console.error('[bookings]', error);
      const booking = {
        id: `bk_${Date.now()}`,
        providerId: body.providerId,
        providerName: body.providerName,
        date: body.date,
        time: body.time,
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
      booking: {
        id: data.id,
        providerId: body.providerId,
        providerName: body.providerName,
        date: body.date,
        time: body.time,
        notes: body.notes ?? '',
        sessionType: body.sessionType,
        meetingLink: data.meeting_link ?? meetingLink,
        status: 'confirmed',
        createdAt: data.created_at,
      },
      source: 'database',
    });
  } catch {
    return NextResponse.json({ error: 'Could not save booking.' }, { status: 500 });
  }
}
