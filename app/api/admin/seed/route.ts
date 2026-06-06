import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { generateAlias } from '@/lib/utils/aliasGenerator'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { KNOWLEDGE_ENTRIES } from '@/lib/ai/knowledgeBase'
import * as crypto from 'crypto'

export const dynamic = 'force-dynamic'

const religions = ['orthodox', 'protestant', 'muslim', 'none'] as const
const languages = ['amharic', 'english', 'oromifa'] as const

const DEMO_USER_ID = '00000000-0000-4000-a000-000000000028'

async function seedUsers(supabase: ReturnType<typeof createServerClient>) {
  for (let i = 0; i < 25; i++) {
    const id = crypto.randomUUID()
    const alias = generateAlias()
    await supabase.from('profiles').upsert({
      id,
      alias,
      language: languages[Math.floor(Math.random() * languages.length)],
      triggers: [],
      recovery_goal: 30,
      religion: religions[Math.floor(Math.random() * religions.length)],
      onboarding_done: true,
    })

    const streakDays = Math.floor(Math.random() * 45)
    await supabase.from('streaks').upsert({
      user_id: id,
      current_streak: streakDays,
      longest_streak: streakDays + Math.floor(Math.random() * 15),
      total_clean_days: streakDays + Math.floor(Math.random() * 30),
    })
  }

  await supabase.from('profiles').upsert({
    id: DEMO_USER_ID,
    alias: 'Biruk-Eagle-28',
    language: 'english',
    triggers: ['stress', 'late_night'],
    recovery_goal: 30,
    religion: 'orthodox',
    onboarding_done: true,
  })

  await supabase.from('streaks').upsert({
    user_id: DEMO_USER_ID,
    current_streak: 28,
    longest_streak: 28,
    total_clean_days: 30,
  })

  return { users: 26 }
}

async function seedLogs(supabase: ReturnType<typeof createServerClient>) {
  let total = 0

  const { data: seedProfiles } = await supabase
    .from('profiles')
    .select('id')
    .not('id', 'eq', DEMO_USER_ID)
    .limit(25)

  const userIds = (seedProfiles || []).map(p => p.id)

  for (let u = 0; u < Math.min(25, userIds.length); u++) {
    const userId = userIds[u]
    let streak = 0
    const relapsedDays = new Set<number>()
    const numRelapses = 2 + Math.floor(Math.random() * 2)
    while (relapsedDays.size < numRelapses) {
      const day = 5 + Math.floor(Math.random() * 50)
      relapsedDays.add(day)
    }

    for (let d = 59; d >= 0; d--) {
      const logDate = new Date()
      logDate.setDate(logDate.getDate() - d)
      const dateStr = logDate.toISOString().split('T')[0]
      const dayOfWeek = logDate.getDay()

      const baseMood = 5 + Math.sin(d * 0.15) * 2 + (Math.random() - 0.5) * 1.5
      const moodScore = Math.round(Math.max(1, Math.min(10, baseMood)))
      const stressLevel = Math.round(Math.max(1, Math.min(10, 8 - baseMood + Math.random() * 3)))
      const urgeIntensity = Math.round(Math.max(1, Math.min(10, 3 + Math.random() * 5)))

      const isRelapse = relapsedDays.has(d)
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
      const khatUsed = isRelapse || (isWeekend && Math.random() < 0.4)
      const alcoholUsed = isRelapse && Math.random() < 0.3
      const panicEvent = d > 5 && Math.random() < 0.01 && !isRelapse

      const triggers: string[] = []
      if (stressLevel > 7) triggers.push('stress')
      if (dayOfWeek >= 5) triggers.push('late_night')
      if (Math.random() < 0.3) triggers.push('boredom')

      await supabase.from('habit_logs').insert({
        user_id: userId,
        log_date: dateStr,
        mood_score: moodScore,
        stress_level: stressLevel,
        urge_intensity: urgeIntensity,
        relapsed: isRelapse,
        khat_used_today: khatUsed,
        alcohol_used_today: alcoholUsed,
        trigger_tags: triggers,
        ai_intervention_triggered: panicEvent,
      })

      if (!isRelapse && !khatUsed) streak++
      else streak = 0
      total++
    }

    const longestStreak = streak + Math.floor(Math.random() * 10)
    await supabase.from('streaks').update({
      current_streak: streak,
      longest_streak: Math.max(streak, longestStreak),
      total_clean_days: streak + Math.floor(Math.random() * 20),
    }).eq('user_id', userId)
  }

  // Demo user — 60 days, skip TODAY so judges see the form live
  const demoStreak = 28
  for (let d = 59; d >= 1; d--) {
    const logDate = new Date()
    logDate.setDate(logDate.getDate() - d)
    const dateStr = logDate.toISOString().split('T')[0]

    await supabase.from('habit_logs').insert({
      user_id: DEMO_USER_ID,
      log_date: dateStr,
      mood_score: 6 + Math.round(Math.sin(d * 0.2) * 1.5 + (Math.random() - 0.5)),
      stress_level: 4 + Math.round(Math.sin(d * 0.15) * 2 + (Math.random() - 0.5) * 1.5),
      urge_intensity: d < 10 ? 8 : 3 + Math.round(Math.random() * 3),
      relapsed: false,
      khat_used_today: d > 27 ? false : d > 25,
      alcohol_used_today: false,
      trigger_tags: d < 10 ? ['stress', 'late_night'] : [],
      ai_intervention_triggered: d === 14 || d === 7,
    })
    total++
  }

  await supabase.from('streaks').update({
    current_streak: demoStreak,
    longest_streak: demoStreak,
    total_clean_days: demoStreak + 2,
  }).eq('user_id', DEMO_USER_ID)

  return { logs: total }
}

async function seedProviders(supabase: ReturnType<typeof createServerClient>) {
  const providers = [
    { name: 'Dr. Hiwot Bekele', type: 'psychiatrist', specialization: 'Addiction Psychiatry', city: 'Addis Abeba', bio: 'Specializing in substance use disorders with 15+ years of experience at Yekatit 12 Hospital.', languages: ['Amharic', 'English'], consultation_fee: 120, online: true, in_person: true },
    { name: 'Dr. Yonas Alemu', type: 'psychiatrist', specialization: 'Adolescent Mental Health', city: 'Addis Abeba', bio: 'Dedicated to supporting young adults through recovery with trauma-informed approaches.', languages: ['Amharic', 'English'], consultation_fee: 100, online: true, in_person: true },
    { name: 'Dr. Selam Tesfaye', type: 'psychiatrist', specialization: 'Trauma-Informed Care', city: 'Addis Abeba', bio: 'Holistic approach to mental health and addiction recovery with focus on mindfulness.', languages: ['Amharic', 'English'], consultation_fee: 80, online: true, in_person: false },
    { name: 'Meron Gizaw', type: 'counselor', specialization: 'CBT & Recovery Coaching', city: 'Hawassa', bio: 'Certified cognitive behavioral therapist specializing in khat recovery and relapse prevention.', languages: ['Amharic', 'English'], consultation_fee: 0, pro_bono: true, online: true, in_person: true },
    { name: 'Dawit Hailu', type: 'counselor', specialization: 'Group Therapy & Support', city: 'Addis Abeba', bio: 'Leading group recovery sessions with proven outcomes. Specializes in peer support dynamics.', languages: ['Amharic', 'English', 'Oromifa'], consultation_fee: 50, online: true, in_person: true },
    { name: 'Debre Selam Orthodox Church', type: 'religious_org', specialization: 'Faith-Based Recovery Program', city: 'Addis Abeba', bio: '12-week faith-centered restoration fellowship combining scripture study with group support.', languages: ['Amharic'], consultation_fee: 0, pro_bono: true, online: false, in_person: true },
    { name: 'Ethiopian Evangelical Fellowship', type: 'religious_org', specialization: 'Spiritual Healing & Support', city: 'Addis Abeba', bio: 'Community-based spiritual support for recovery with pastoral counseling and prayer groups.', languages: ['Amharic', 'English'], consultation_fee: 0, pro_bono: true, online: true, in_person: true },
    { name: 'Al-Noor Wellness Center', type: 'religious_org', specialization: 'Islamic Counseling & Support', city: 'Dire Dawa', bio: 'Culturally grounded support within Islamic tradition, offering holistic wellness programs.', languages: ['Amharic', 'Oromifa'], consultation_fee: 0, pro_bono: true, online: true, in_person: true },
  ]

  for (const p of providers) {
    await supabase.from('providers').insert({
      ...p,
      is_verified: true,
      is_active: true,
      region: 'Ethiopia',
    })
  }

  await supabase.from('providers').insert({
    name: 'Dr. Amanuel Gebre',
    type: 'psychiatrist',
    specialization: 'Child & Adolescent Psychiatry',
    city: 'Mekelle',
    bio: 'New provider awaiting verification. Specializes in adolescent mental health in conflict-affected regions.',
    languages: ['Amharic', 'Tigrinya', 'English'],
    consultation_fee: 90,
    pro_bono: false,
    online: true,
    in_person: true,
    is_verified: false,
    is_active: false,
    region: 'Ethiopia',
  })

  return { providers: 9 }
}

async function seedChat(supabase: ReturnType<typeof createServerClient>) {
  const messages = [
    'Today is day 14. I never thought I could make it this far.',
    'Had a tough day but I did not give in. Small victories matter.',
    'Feeling grateful for this community. You all keep me going.',
    'Just finished my morning meditation. Starting the day strong.',
    'I relapsed yesterday. But I am back here today. That counts, right?',
    'Your presence here today is a victory. Keep going.',
    'Day 30! I am celebrating with a long walk in the sun.',
    'The urges come and go like waves. I am learning to surf them.',
    'Anyone else finding it hard during exam season?',
    'Remember why you started. You deserve healing.',
    'The support here is unlike anywhere else. Thank you.',
    'One month clean today. Never going back.',
    'Does anyone have tips for dealing with social pressure?',
    'I told my family about my recovery today. They were supportive.',
    'Some days are harder than others. But I keep showing up.',
  ]

  const milestoneMessages = [
    'Today marks 7 days of growth and resilience. Thank you SafeGround community for being my anchor.',
    'Today marks 14 days of growth and resilience. I am learning to be kind to myself.',
    'Today marks 30 days of growth and resilience. This community changed my life.',
  ]

  for (let i = 0; i < 50; i++) {
    const hoursAgo = Math.floor(Math.random() * 24)
    const sentAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
    const alias = generateAlias()

    if (i < 3) {
      await supabase.from('anonymous_chat').insert({
        room_id: 'global',
        user_alias: alias,
        message: milestoneMessages[i],
        message_type: 'milestone_share',
        is_flagged: false,
        is_deleted: false,
        created_at: sentAt,
      })
    } else if (i === 49) {
      await supabase.from('anonymous_chat').insert({
        room_id: 'global',
        user_alias: alias,
        message: 'I cannot believe this is happening to me. Everyone is out to get me.',
        message_type: 'text',
        is_flagged: true,
        flag_reason: 'aggressive',
        is_deleted: false,
        created_at: sentAt,
      })
    } else {
      await supabase.from('anonymous_chat').insert({
        room_id: 'global',
        user_alias: alias,
        message: messages[Math.floor(Math.random() * messages.length)],
        message_type: 'text',
        is_flagged: false,
        is_deleted: false,
        created_at: sentAt,
      })
    }
  }

  return { messages: 50 }
}

async function seedGuardians(supabase: ReturnType<typeof createServerClient>) {
  const { data: seedProfiles } = await supabase
    .from('profiles')
    .select('id')
    .not('id', 'eq', DEMO_USER_ID)
    .limit(10);
  const ids = (seedProfiles || []).map(p => p.id);

  const guardians = [
    { user_id: ids[0] || crypto.randomUUID(), token: 'guardian-seed-001-alpha-bravo-charlie', guardian_alias: 'Guardian-A', relationship: 'family', is_active: true },
    { user_id: ids[5] || crypto.randomUUID(), token: 'guardian-seed-002-delta-echo-foxtrot', guardian_alias: 'Guardian-B', relationship: 'trusted_friend', is_active: true },
    { user_id: DEMO_USER_ID, token: 'demo-guardian-token-safeground-2024', guardian_alias: 'Guardian', relationship: 'family', is_active: true, notify_on_panic: true, notify_on_relapse: true, notify_streak_break: false, monitoring_level: 'alert_only' },
  ]

  for (const g of guardians) {
    await supabase.from('guardian_controls').insert({
      ...g,
      monitoring_level: g.monitoring_level || 'standard',
      notify_on_panic: g.notify_on_panic ?? true,
      notify_on_relapse: g.notify_on_relapse ?? false,
      notify_streak_break: g.notify_streak_break ?? true,
    })
  }

  return { guardians: guardians.length }
}

async function seedBookings(supabase: ReturnType<typeof createServerClient>) {
  const { data: providers } = await supabase
    .from('providers')
    .select('id')
    .ilike('name', '%Hiwot%')
    .limit(1)

  const hiwotId = providers?.[0]?.id

  if (hiwotId) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

      await supabase.from('telehealth_bookings').insert({
        user_id: DEMO_USER_ID,
        provider_id: hiwotId,
      session_type: 'follow_up',
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 50,
      status: 'confirmed',
    })
  }

  const { data: seedProfiles } = await supabase
    .from('profiles')
    .select('id')
    .not('id', 'eq', DEMO_USER_ID)
    .limit(25);
  const userIds = (seedProfiles || []).map(p => p.id);

  const { data: allProviders } = await supabase.from('providers').select('id').limit(5)
  if (allProviders) {
    const tomorrow10am = new Date()
    tomorrow10am.setDate(tomorrow10am.getDate() + 1)
    tomorrow10am.setHours(10, 0, 0, 0)

    for (let i = 0; i < 4; i++) {
      const bookingDate = new Date(tomorrow10am)
      bookingDate.setDate(bookingDate.getDate() + Math.floor(i / 2))
      bookingDate.setHours(i % 2 === 0 ? 10 : 14, 0, 0, 0)

      await supabase.from('telehealth_bookings').insert({
        user_id: userIds[i * 6] || crypto.randomUUID(),
        provider_id: allProviders[i % allProviders.length].id,
        session_type: i === 0 ? 'initial' : i === 1 ? 'follow_up' : i === 2 ? 'crisis' : 'follow_up',
        scheduled_at: bookingDate.toISOString(),
        duration_minutes: 50,
        status: i === 1 ? 'pending' : 'confirmed',
      })
    }
  }

  return { bookings: 5 }
}

async function seedDemo(supabase: ReturnType<typeof createServerClient>) {
  await supabase.from('profiles').delete().eq('id', DEMO_USER_ID)
  await supabase.from('streaks').delete().eq('user_id', DEMO_USER_ID)
  await supabase.from('habit_logs').delete().eq('user_id', DEMO_USER_ID)
  await supabase.from('guardian_controls').delete().eq('user_id', DEMO_USER_ID)
  await supabase.from('telehealth_bookings').delete().eq('user_id', DEMO_USER_ID)
  await supabase.from('notification_logs').delete().eq('user_id', DEMO_USER_ID)

  await supabase.from('profiles').insert({
    id: DEMO_USER_ID,
    alias: 'Biruk-Eagle-28',
    language: 'english',
    triggers: ['stress', 'late_night'],
    recovery_goal: 30,
    religion: 'orthodox',
    onboarding_done: true,
  })
  await supabase.from('streaks').upsert({
    user_id: DEMO_USER_ID,
    current_streak: 28,
    longest_streak: 28,
    total_clean_days: 30,
  })

  // 59 days of logs (skip today so judges see the form)
  for (let d = 59; d >= 1; d--) {
    const logDate = new Date()
    logDate.setDate(logDate.getDate() - d)
    await supabase.from('habit_logs').insert({
      user_id: DEMO_USER_ID,
      log_date: logDate.toISOString().split('T')[0],
      mood_score: 6 + Math.round(Math.sin(d * 0.2) * 1.5 + (Math.random() - 0.5)),
      stress_level: 4 + Math.round(Math.sin(d * 0.15) * 2 + (Math.random() - 0.5) * 1.5),
      urge_intensity: d < 10 ? 8 : 3 + Math.round(Math.random() * 3),
      relapsed: false,
      khat_used_today: d > 27 ? false : d > 25,
      alcohol_used_today: false,
      trigger_tags: d < 10 ? ['stress', 'late_night'] : [],
      ai_intervention_triggered: d === 14 || d === 7,
    })
  }

  // Demo guardian link
  await supabase.from('guardian_controls').insert({
    user_id: DEMO_USER_ID,
    token: 'demo-guardian-token-safeground-2024',
    guardian_alias: 'Guardian',
    relationship: 'family',
    monitoring_level: 'alert_only',
    notify_on_panic: true,
    notify_on_relapse: true,
    notify_streak_break: false,
    is_active: true,
  })

  // Upcoming booking with Dr. Hiwot Bekele, tomorrow 10:00 AM
  const { data: hiwot } = await supabase.from('providers').select('id').ilike('name', '%Hiwot%').limit(1)
  if (hiwot?.[0]) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    await supabase.from('telehealth_bookings').insert({
      user_id: DEMO_USER_ID,
      provider_id: hiwot[0].id,
      session_type: 'follow_up',
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 50,
      status: 'confirmed',
    })
  }

  // Faith program enrollment
  await supabase.from('notification_logs').insert({
    user_id: DEMO_USER_ID,
    type: 'program_enrollment',
    message: 'You are enrolled in Restoration Fellowship — Week 4 of 12.',
    read: false,
  })

  return { message: 'Demo account reset with guardian, booking, and faith enrollment' }
}

async function seedKnowledge(supabase: ReturnType<typeof createServerClient>) {
  let success = 0;
  let fail = 0;
  for (const entry of KNOWLEDGE_ENTRIES) {
    try {
      const embedding = await generateEmbedding(entry.content);
      const { error } = await supabase.from('knowledge_base').insert({
        content: entry.content,
        category: entry.category,
        source: entry.source,
        embedding,
      });
      if (error) { fail++; console.error('[seed] knowledge insert:', error.message); }
      else { success++; }
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      fail++;
      console.error('[seed] knowledge error:', err);
    }
  }
  return { knowledge_seeded: success, knowledge_failed: fail };
}

export async function POST(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    switch (type) {
      case 'auth': {
        const accounts = [
          { email: 'admin@gmail.com', password: 'SafeGroundAdmin123!', role: 'admin' },
          { email: 'demo.student@safeground.test', password: 'SafeGroundStudent123!', role: 'student' },
          { email: 'demo.user@safeground.test', password: 'SafeGroundDemo123!', role: 'demo' },
          { email: 'provider@safeground.test', password: 'SafeGroundProvider123!', role: 'provider' },
        ]
        const results: string[] = []
        for (const acct of accounts) {
          const { data: existing } = await supabase.auth.admin.listUsers()
          const users = existing?.users as { email?: string; id: string }[] | undefined
          const found = users?.find(u => u.email === acct.email)
          if (found) {
            results.push(`${acct.email} already exists`)
            continue
          }
          const { data, error } = await supabase.auth.admin.createUser({
            email: acct.email,
            password: acct.password,
            email_confirm: true,
          })
          if (error) { results.push(`${acct.email}: ${error.message}`); continue }
          if (acct.role === 'admin' || acct.role === 'provider' || acct.role === 'demo') {
            const alias = acct.role === 'admin' ? 'Admin-SafeGround-00'
              : acct.role === 'demo' ? 'Biruk-Eagle-28'
              : 'Dr-Provider-00'
            const streak = acct.role === 'demo' ? 28 : 0

            await supabase.from('profiles').upsert({
              id: data.user.id,
              alias,
              language: 'english',
              triggers: acct.role === 'demo' ? ['stress', 'late_night'] : [],
              recovery_goal: 30,
              religion: acct.role === 'demo' ? 'orthodox' : null,
              onboarding_done: true,
            }, { onConflict: 'id' })
            await supabase.from('streaks').upsert({
              user_id: data.user.id,
              current_streak: streak,
              longest_streak: streak,
              total_clean_days: streak + 2,
            }, { onConflict: 'user_id' })
          }
          results.push(`${acct.email} created -> ${data.user.id}`)
        }
        return NextResponse.json({ success: true, message: results.join('; ') })
      }
      case 'users': {
        const result = await seedUsers(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'logs': {
        const result = await seedLogs(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'providers': {
        const result = await seedProviders(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'chat': {
        const result = await seedChat(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'guardians': {
        const result = await seedGuardians(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'bookings': {
        const result = await seedBookings(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'knowledge': {
        const result = await seedKnowledge(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'demo': {
        const result = await seedDemo(supabase)
        return NextResponse.json({ success: true, ...result })
      }
      case 'clear': {
        await supabase.from('profiles').delete().neq('id', 'placeholder')
        await supabase.from('habit_logs').delete().neq('id', 'placeholder')
        await supabase.from('streaks').delete().neq('id', 'placeholder')
        await supabase.from('providers').delete().neq('id', 'placeholder')
        await supabase.from('anonymous_chat').delete().neq('id', 'placeholder')
        await supabase.from('telehealth_bookings').delete().neq('id', 'placeholder')
        await supabase.from('guardian_controls').delete().neq('id', 'placeholder')
        await supabase.from('notification_logs').delete().neq('id', 'placeholder')
        await supabase.from('knowledge_base').delete().neq('id', 0)
        return NextResponse.json({ success: true, message: 'All data cleared' })
      }
      default:
        return NextResponse.json({ error: 'Invalid seed type' }, { status: 400 })
    }
  } catch (error) {
    console.error('[admin/seed] Error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
