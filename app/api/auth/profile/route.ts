import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, alias, language_pref, support_preference, trigger_tags, streak_goal, region, religion, onboarding_done, created_at, updated_at'
      )
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[profile GET]', error);
      return NextResponse.json({
        profile: {
          id: user.id,
          alias: user.user_metadata?.alias ?? 'Anonymous',
          religion: user.user_metadata?.religion ?? null,
          language_pref: 'english',
          support_preference: 'secular',
          onboarding_done: Boolean(user.user_metadata?.onboarding_complete),
        },
      });
    }

    return NextResponse.json({
      profile: {
        ...data,
        religion: data?.religion ?? user.user_metadata?.religion ?? null,
      },
    });
  } catch (error) {
    console.error('[profile GET]', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.religion != null) updates.religion = body.religion;
    if (body.language_pref != null) updates.language_pref = body.language_pref;
    if (body.support_preference != null) updates.support_preference = body.support_preference;
    if (body.trigger_tags != null) updates.trigger_tags = body.trigger_tags;
    if (body.streak_goal != null) updates.streak_goal = body.streak_goal;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
      .select('id, alias, religion, language_pref, support_preference')
      .single();

    if (error) {
      console.error('[profile PATCH]', error);
    }

    if (body.religion != null) {
      await supabase.auth.updateUser({ data: { religion: body.religion } });
    }

    return NextResponse.json({
      success: true,
      profile: data ?? { id: user.id, religion: body.religion },
    });
  } catch (error) {
    console.error('[profile PATCH]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alias, language_pref, support_preference, trigger_tags, streak_goal, religion } =
      await request.json();

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      alias,
      language_pref: language_pref || 'english',
      support_preference: support_preference || 'secular',
      trigger_tags: trigger_tags || [],
      streak_goal: streak_goal || 30,
      religion: religion ?? null,
      onboarding_done: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;

    if (religion) {
      await supabase.auth.updateUser({ data: { religion } });
    }

    const { error: streakError } = await supabase.from('streaks').upsert({
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
      total_clean_days: 0,
    });

    if (streakError) throw streakError;

    return NextResponse.json({ success: true, profile: { id: user.id, alias, religion } });
  } catch (error) {
    console.error('[profile POST]', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
