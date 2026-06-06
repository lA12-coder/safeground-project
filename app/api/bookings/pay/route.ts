import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMissingSupabaseColumn } from '@/lib/supabase/schema-errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bookingId = body.booking_id ?? body.bookingId;
    const paymentMethod = body.payment_method ?? body.paymentMethod ?? 'chapa';
    const phone = body.phone ? String(body.phone) : undefined;

    if (!bookingId) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const paidAt = new Date().toISOString();
    const paymentPayload = {
      payment_status: 'paid',
      payment_method: paymentMethod,
      paid_at: paidAt,
      status: 'confirmed',
    };

    let { data, error } = await supabase
      .from('telehealth_bookings')
      .update(paymentPayload)
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .select('id, status, payment_status, payment_method, amount_etb, meeting_link, scheduled_at')
      .single();

    if (error && isMissingSupabaseColumn(error)) {
      const legacy = await supabase
        .from('telehealth_bookings')
        .update({ status: 'confirmed', notes: `Paid via ${paymentMethod}${phone ? ` (${phone})` : ''}` })
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .select('id, status, payment_status, payment_method, amount_etb, meeting_link, scheduled_at')
        .single();
      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      const legacyBooking = await supabase
        .from('bookings')
        .update(paymentPayload)
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .select('id, status, payment_status, payment_method, amount_etb, meeting_link, scheduled_at')
        .single();

      if (legacyBooking.error) {
        console.error('[bookings/pay]', error, legacyBooking.error);
        return NextResponse.json({ error: 'Payment could not be recorded' }, { status: 500 });
      }
      data = legacyBooking.data;
    }

    return NextResponse.json({
      success: true,
      booking: data,
      receipt: {
        id: data?.id,
        method: paymentMethod,
        paid_at: paidAt,
        amount_etb: (data as { amount_etb?: number })?.amount_etb ?? body.amount_etb,
      },
    });
  } catch (error) {
    console.error('[bookings/pay]', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
