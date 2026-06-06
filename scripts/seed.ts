import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found. Create one from .env.local.example')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const regions = ['Addis Abeba', 'Hawassa', 'Dire Dawa', 'Mekelle', 'Bahir Dar'] as const
const religions = ['orthodox', 'protestant', 'muslim', 'none'] as const
const languages = ['amharic', 'english', 'oromifa'] as const

function generateAlias(): string {
  const adjectives = ['Selam', 'Biruk', 'Tsega', 'Fiker', 'Tena', 'Nitsuh', 'Haile', 'Abebe', 'Genet', 'Abenezer', 'Chora']
  const animals = ['Lion', 'Eagle', 'Crane', 'Gazelle', 'Wolf', 'Falcon', 'Cheetah', 'Ibis', 'Eland', 'Jackal', 'Otter', 'Dove']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const num = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${adj}-${animal}-${num}`
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ── Seed Auth Users ─────────────────────────────────────
async function seedAuth() {
  console.log('Creating auth users for demo login...')

  const accounts = [
    { email: 'admin@gmail.com', password: 'SafeGroundAdmin123!', role: 'admin' },
    { email: 'demo.student@safeground.test', password: 'SafeGroundStudent123!', role: 'student' },
    { email: 'demo.user@safeground.test', password: 'SafeGroundDemo123!', role: 'demo' },
    { email: 'provider@safeground.test', password: 'SafeGroundProvider123!', role: 'provider' },
  ]

  for (const acct of accounts) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers()
    const users = existing?.users as { email?: string; id: string }[] | undefined
    const found = users?.find(u => u.email === acct.email)
    if (found) {
      console.log(`  Auth user ${acct.email} already exists (id: ${found.id})`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: acct.email,
      password: acct.password,
      email_confirm: true,
    })

    if (error) {
      console.error(`  Failed to create ${acct.email}:`, error.message)
      continue
    }

    console.log(`  Created auth user ${acct.email} -> ${data.user.id}`)

    // Create profile for the auth user
    if (acct.role === 'admin') {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        alias: 'Admin-SafeGround-00',
        language: 'english',
        triggers: [],
        recovery_goal: 30,
        onboarding_done: true,
      }, { onConflict: 'id' })
      await supabase.from('streaks').upsert({
        user_id: data.user.id,
        current_streak: 0,
        longest_streak: 0,
        total_clean_days: 0,
      }, { onConflict: 'user_id' })
    } else if (acct.role === 'provider') {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        alias: 'Dr-Provider-00',
        language: 'english',
        triggers: [],
        recovery_goal: 0,
        onboarding_done: true,
      }, { onConflict: 'id' })
      await supabase.from('streaks').upsert({
        user_id: data.user.id,
        current_streak: 0,
        longest_streak: 0,
        total_clean_days: 0,
      }, { onConflict: 'user_id' })
    } else if (acct.role === 'demo') {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        alias: 'Biruk-Eagle-28',
        language: 'english',
        triggers: ['stress', 'late_night'],
        recovery_goal: 30,
        religion: 'orthodox',
        onboarding_done: true,
      }, { onConflict: 'id' })
      await supabase.from('streaks').upsert({
        user_id: data.user.id,
        current_streak: 28,
        longest_streak: 28,
        total_clean_days: 30,
      }, { onConflict: 'user_id' })
    }
  }

  console.log('✅ Auth users seeded')
}

const DEMO_USER_ID = 'd88f56b0-908e-40f1-9195-d5def890af5f'

async function getProfileIds() {
  const { data } = await supabase.from('profiles').select('id').limit(50)
  return (data || []).map(p => p.id)
}

// ── Seed Habit Logs ──────────────────────────────────────
async function seedLogs() {
  console.log('Seeding 60 days of habit logs per user...')
  const userIds = await getProfileIds()
  let total = 0

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

  // Demo user — 60 days, but skip TODAY so judges see the form live
  console.log('Seeding demo-user habit logs (skipping today)...')
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

  console.log(`✅ ${total} habit logs seeded`)
}

// ── Seed Providers ───────────────────────────────────────
async function seedProviders() {
  console.log('Seeding 8 provider listings...')
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
    await supabase.from('providers').upsert({
      ...p,
      is_verified: true,
      is_active: true,
      region: 'Ethiopia',
    }, { onConflict: 'id' })
  }

  // One unverified provider for the admin queue
  await supabase.from('providers').upsert({
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

  console.log('✅ 9 provider listings seeded (8 verified + 1 pending)')
}

// ── Seed Chat ────────────────────────────────────────────
async function seedChat() {
  console.log('Seeding 50 chat messages...')
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
      await supabase.from('anonymous_chat').upsert({
        room_id: 'global',
        user_alias: alias,
        message: milestoneMessages[i],
        message_type: 'milestone_share',
        is_flagged: false,
        is_deleted: false,
        created_at: sentAt,
      })
    } else if (i === 49) {
      await supabase.from('anonymous_chat').upsert({
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
      await supabase.from('anonymous_chat').upsert({
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

  console.log('✅ 50 chat messages seeded (1 flagged)')
}

// ── Seed Guardians ──────────────────────────────────────
async function seedGuardians() {
  console.log('Seeding guardian links...')
  const userIds = await getProfileIds()
  const guardians = [
    { user_id: userIds[0] || DEMO_USER_ID, token: 'guardian-seed-001-alpha-bravo-charlie', guardian_alias: 'Guardian-A', relationship: 'family', is_active: true },
    { user_id: userIds[Math.min(5, userIds.length-1)] || DEMO_USER_ID, token: 'guardian-seed-002-delta-echo-foxtrot', guardian_alias: 'Guardian-B', relationship: 'trusted_friend', is_active: true },
    { user_id: DEMO_USER_ID, token: 'demo-guardian-token-safeground-2024', guardian_alias: 'Guardian', relationship: 'family', is_active: true, notify_on_panic: true, notify_on_relapse: true, notify_streak_break: false, monitoring_level: 'alert_only' },
  ]

  for (const g of guardians) {
    await supabase.from('guardian_controls').upsert({
      ...g,
      monitoring_level: g.monitoring_level || 'standard',
      notify_on_panic: g.notify_on_panic ?? true,
      notify_on_relapse: g.notify_on_relapse ?? false,
      notify_streak_break: g.notify_streak_break ?? true,
    }, { onConflict: 'token' })
  }

  console.log(`✅ ${guardians.length} guardian links created`)
}

// ── Seed Bookings ────────────────────────────────────────
async function seedBookings() {
  console.log('Seeding telehealth bookings...')
  const userIds = await getProfileIds()

  // Get a provider ID for Dr. Hiwot Bekele
  const { data: providers } = await supabase
    .from('providers')
    .select('id, name')
    .ilike('name', '%Hiwot%')
    .limit(1)

  const hiwotId = providers?.[0]?.id

  // Demo-user booking: tomorrow at 10:00 AM
  if (hiwotId) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    await supabase.from('telehealth_bookings').upsert({
      user_id: DEMO_USER_ID,
      provider_id: hiwotId,
      session_type: 'follow_up',
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 50,
      status: 'confirmed',
      notes: null,
    })
  }

  // Some additional bookings
  const tomorrow10am = new Date()
  tomorrow10am.setDate(tomorrow10am.getDate() + 1)
  tomorrow10am.setHours(10, 0, 0, 0)

  const { data: allProviders } = await supabase.from('providers').select('id').limit(5)
  if (allProviders) {
    for (let i = 0; i < 4; i++) {
      const bookingDate = new Date(tomorrow10am)
      bookingDate.setDate(bookingDate.getDate() + Math.floor(i / 2))
      bookingDate.setHours(i % 2 === 0 ? 10 : 14, 0, 0, 0)

      await supabase.from('telehealth_bookings').upsert({
        user_id: userIds[i * 6] || DEMO_USER_ID,
        provider_id: allProviders[i % allProviders.length].id,
        session_type: i === 0 ? 'initial' : i === 1 ? 'follow_up' : i === 2 ? 'crisis' : 'follow_up',
        scheduled_at: bookingDate.toISOString(),
        duration_minutes: 50,
        status: i === 1 ? 'pending' : 'confirmed',
        notes: null,
      })
    }
  }

  console.log('✅ 5 telehealth bookings created')
}

// ── Seed Faith Program Enrollment ──────────────────────
async function seedFaithProgram() {
  console.log('Seeding demo faith program enrollment...')
  await supabase.from('notification_logs').upsert({
    user_id: DEMO_USER_ID,
    type: 'program_enrollment',
    message: 'You are enrolled in Restoration Fellowship — Week 4 of 12.',
    read: false,
  })
  console.log('✅ Faith program enrollment seeded')
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const types = args.length > 0 ? args : ['full']

  console.log('╔══════════════════════════════════════╗')
  console.log('║   SafeGround Seed Data Generator     ║')
  console.log('╚══════════════════════════════════════╝')
  console.log()

  const startTime = Date.now()

  if (types.includes('full') || types.includes('auth')) await seedAuth()
  if (types.includes('full') || types.includes('logs')) await seedLogs()
  if (types.includes('full') || types.includes('providers')) await seedProviders()
  if (types.includes('full') || types.includes('chat')) await seedChat()
  if (types.includes('full') || types.includes('guardians')) await seedGuardians()
  if (types.includes('full') || types.includes('bookings')) await seedBookings()
  if (types.includes('full') || types.includes('program')) await seedFaithProgram()

  if (types.includes('clear')) {
    console.log('Clearing all data...')
    await supabase.from('profiles').delete().neq('id', 'placeholder')
    await supabase.from('habit_logs').delete().neq('id', 'placeholder')
    await supabase.from('streaks').delete().neq('id', 'placeholder')
    await supabase.from('providers').delete().neq('id', 'placeholder')
    await supabase.from('anonymous_chat').delete().neq('id', 'placeholder')
    await supabase.from('telehealth_bookings').delete().neq('id', 'placeholder')
    await supabase.from('guardian_controls').delete().neq('id', 'placeholder')
    await supabase.from('notification_logs').delete().neq('id', 'placeholder')
    console.log('✅ All data cleared')
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log()
  console.log(`✨ Done in ${elapsed}s`)

  // Summary
  const { count: profiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: logs } = await supabase.from('habit_logs').select('*', { count: 'exact', head: true })
  const { count: providers } = await supabase.from('providers').select('*', { count: 'exact', head: true })
  const { count: messages } = await supabase.from('anonymous_chat').select('*', { count: 'exact', head: true })
  const { count: bookings } = await supabase.from('telehealth_bookings').select('*', { count: 'exact', head: true })
  const { count: guardians } = await supabase.from('guardian_controls').select('*', { count: 'exact', head: true })
  console.log()
  console.log('📊 Summary:')
  console.log(`  Profiles:     ${profiles}`)
  console.log(`  Habit Logs:   ${logs}`)
  console.log(`  Providers:    ${providers}`)
  console.log(`  Chat Msgs:    ${messages}`)
  console.log(`  Bookings:     ${bookings}`)
  console.log(`  Guardians:    ${guardians}`)
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
