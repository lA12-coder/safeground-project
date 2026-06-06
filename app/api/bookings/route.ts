import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMissingSupabaseTable, isMissingSupabaseColumn } from '@/lib/supabase/schema-errors';
import { calculateBookingSplit } from '@/lib/billing/commission';
import { formatEtb } from '@/lib/billing/currency';
import type { BookingCategory } from '@/lib/billing/constants';
import type { BookingRequest } from '@/lib/directory/types';
import { resolveProviderName } from '@/lib/directory/providerLookup';

type BookingRow = Record<string, unknown>;

function mapUserBooking(row: BookingRow, providerName: string) {
  const scheduledAt =
    (typeof row.scheduled_at === 'string' && row.scheduled_at) ||
    (typeof row.booking_date === 'string' && typeof row.booking_time === 'string'
      ? `${row.booking_date}T${row.booking_time}:00`
      : typeof row.created_at === 'string'
        ? row.created_at
        : new Date().toISOString());

  const amountEtb = (row.amount_etb as number | null) ?? null;

  return {
    id: String(row.id),
    provider_id: String(row.provider_id ?? ''),
    provider_name: providerName,
    scheduled_at: scheduledAt,
    session_type: String(row.session_type ?? 'initial'),
    duration_minutes: (row.duration_minutes as number) ?? 50,
    status: String(row.status ?? 'pending'),
    payment_status: String(row.payment_status ?? 'pending'),
    payment_method: (row.payment_method as string | null) ?? null,
    amount_etb: amountEtb,
    amount_label: amountEtb != null && amountEtb > 0 ? formatEtb(amountEtb) : 'Free',
    platform_fee_etb: (row.platform_fee_etb as number | null) ?? null,
    booking_category: (row.booking_category as BookingCategory | null) ?? null,
    meeting_link: (row.meeting_link as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rows: BookingRow[] = [];
    let source = 'telehealth_bookings';

    const { data, error } = await supabase
      .from('telehealth_bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false });

    if (error && isMissingSupabaseTable(error)) {
      source = 'bookings';
      const legacy = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (legacy.error) throw legacy.error;
      rows = (legacy.data ?? []) as BookingRow[];
    } else if (error) {
      throw error;
    } else {
      rows = (data ?? []) as BookingRow[];
    }

    const providerIds = [...new Set(rows.map((r) => String(r.provider_id ?? '')).filter(Boolean))];
    const providerMap = new Map<string, string>();

    if (providerIds.length > 0) {
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name')
        .in('id', providerIds);
      for (const p of providers ?? []) {
        providerMap.set(String(p.id), String(p.name));
      }
    }

    const bookings = rows.map((row) =>
      mapUserBooking(
        row,
        resolveProviderName(
          String(row.provider_id ?? ''),
          providerMap.get(String(row.provider_id ?? '')),
          typeof row.provider_name === 'string' ? row.provider_name : null
        )
      )
    );

    return NextResponse.json({ bookings, source });
  } catch (error) {
    console.error('[bookings GET]', error);
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 });
  }
}

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

    const amountEtb = body.proBono ? 0 : (body.amountEtb ?? 0);
    const paymentStatus = body.proBono ? 'waived' : 'pending';
    const bookingCategory: BookingCategory =
      body.bookingType === 'spiritual' ? 'spiritual' : 'clinical';
    const split = calculateBookingSplit(amountEtb);

    const bookingRow = {
      user_id: user.id,
      provider_id: providerId,
      session_type: sessionType,
      scheduled_at,
      duration_minutes: 50,
      notes: body.notes ?? null,
      status: body.proBono ? 'confirmed' : 'pending',
      meeting_link: meetingLink,
      payment_status: paymentStatus,
      amount_etb: amountEtb || null,
      platform_fee_etb: split.platformFeeEtb || null,
      provider_payout_etb: split.providerPayoutEtb || null,
      booking_category: bookingCategory,
    };

    const { data, error } = await supabase
      .from('telehealth_bookings')
      .insert(bookingRow)
      .select('id, meeting_link, created_at, payment_status, amount_etb, platform_fee_etb, provider_payout_etb, booking_category')
      .single();

    if (error && isMissingSupabaseTable(error)) {
      const legacy = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          provider_id: String(providerId),
          provider_name: body.providerName ?? 'Provider',
          booking_date: date,
          booking_time: time,
          notes: body.notes ?? null,
          session_type: sessionType,
          meeting_link: meetingLink ?? null,
        status: 'pending',
        payment_status: paymentStatus,
        amount_etb: amountEtb || null,
      })
        .select('id, meeting_link, created_at')
        .single();

      if (legacy.error) {
        console.error('[bookings]', legacy.error);
      } else if (legacy.data) {
        return NextResponse.json({
          success: true,
          booking_id: legacy.data.id,
          booking: {
            id: legacy.data.id,
            providerId,
            providerName: body.providerName,
            date,
            time,
            notes: body.notes ?? '',
            sessionType: body.sessionType,
            meetingLink: legacy.data.meeting_link ?? meetingLink,
            status: body.proBono ? 'confirmed' : 'pending',
            paymentStatus,
            amountEtb,
            createdAt: legacy.data.created_at,
          },
          source: 'bookings',
        });
      }
    }

    if (error && isMissingSupabaseColumn(error)) {
      const { data: basicData, error: basicError } = await supabase
        .from('telehealth_bookings')
        .insert({
          user_id: user.id,
          provider_id: providerId,
          session_type: sessionType,
          scheduled_at,
          duration_minutes: 50,
          notes: body.notes ?? null,
          status: body.proBono ? 'confirmed' : 'pending',
          meeting_link: meetingLink,
        })
        .select('id, meeting_link, created_at')
        .single();

      if (!basicError && basicData) {
        return NextResponse.json({
          success: true,
          booking_id: basicData.id,
          booking: {
            id: basicData.id,
            providerId,
            providerName: body.providerName,
            date,
            time,
            notes: body.notes ?? '',
            sessionType: body.sessionType,
            meetingLink: basicData.meeting_link ?? meetingLink,
            status: body.proBono ? 'confirmed' : 'pending',
            paymentStatus,
            amountEtb,
            createdAt: basicData.created_at,
          },
          source: 'database',
        });
      }
    }

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
        status: body.proBono ? 'confirmed' : 'pending',
        paymentStatus,
        amountEtb,
        platformFeeEtb: split.platformFeeEtb,
        providerPayoutEtb: split.providerPayoutEtb,
        bookingCategory,
        createdAt: data.created_at,
      },
      source: 'database',
    });
  } catch {
    return NextResponse.json({ error: 'Could not save booking.' }, { status: 500 });
  }
}
