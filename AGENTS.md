# SafeGround — Project Documentation

## Overview

SafeGround is a recovery support platform for Ethiopian university students struggling with khat addiction. This doc covers all server-side API routes, admin/guardian/provider dashboards, seed data, and architecture decisions.

---

## Project Structure

```
app/
  api/                          # 27 API route files
  (auth)/                       # Login, Register, Onboarding
  (dashboard)/                  # User dashboard, chat, log, directory, spiritual
  admin/                        # Admin panel (sidebar + pages)
  guardian/[token]/             # Guardian view (public, token-gated)
  guest/                        # Guest chat (no auth)
  org/                          # Org registration + portal
  provider/dashboard/           # Provider dashboard

components/
  admin/                        # MetricCard, ProviderReviewCard, FlaggedMessageCard, DashboardClient
  dashboard/                    # StreakCard, MoodChart, AffirmationCard, etc.
  layout/                       # Sidebar, BottomNav, PanicButton
  guardian/                     # GuardianDashboard, GuardianSetupWizard

lib/
  ai/gemini.ts                  # callGemini(), callGeminiJSON<T>() — Google Gemini SDK wrapper
  supabase/                     # client.ts (browser), server.ts (RSC), middleware.ts (edge)
  types/index.ts                # All TypeScript types
  utils/                        # aliasGenerator, streakUtils, khatRiskDetector

scripts/
  seed.ts                       # Standalone seed script (npx tsx scripts/seed.ts)

middleware.ts                   # Route protection (auth + admin email check)
```

---

## Middleware (`middleware.ts`)

| Path | Access |
|---|---|
| `/`, `/guest`, `/register`, `/login`, `/onboarding` | Public |
| `/guardian/*`, `/org/register` | Public (token-gated) |
| `/admin/*` | Auth required + email in `ADMIN_EMAILS` env var |
| `/dashboard/*`, `/settings/*`, `/provider/*`, `/org/portal/*` | Auth + `onboarding_done` check |

**Admin auth**: Uses `ADMIN_EMAILS` env var (comma-separated). Checks `supabase.auth.getUser().email` against it.

---

## API Routes

### Auth
| Route | Method | Description |
|---|---|---|
| `/api/auth/profile` | POST | Create profile + streaks row after registration |

### Habits
| Route | Method | Description |
|---|---|---|
| `/api/habits/log` | POST | Insert daily habit_log, returns `{ log_id, streak_updated }` |
| `/api/habits/streak` | GET | Return `{ current_streak, longest_streak, total_clean_days, last_clean_date }` |
| `/api/habits/history?days=30` | GET | Last N days of habit_logs for chart data |

### AI
| Route | Method | Description |
|---|---|---|
| `/api/ai/affirmation` | POST | Claude-generated affirmation with 20 hardcoded fallbacks |
| `/api/faith/companion` | POST | Multi-faith spiritual companion (Ethiopian context) |

### Panic
| Route | Method | Description |
|---|---|---|
| `/api/panic` | POST | Insert panic habit_log, Claude coping steps, guardian notification |
| `/api/panic/complete` | POST | Mark streak protected, check milestone (3/7/14/30/60/90 day) |

### Chat
| Route | Method | Description |
|---|---|---|
| `/api/chat/flag` | POST | Set `is_flagged=true` on anonymous_chat message |

### Directory & Bookings
| Route | Method | Description |
|---|---|---|
| `/api/directory?type=&city=&language=&online=&pro_bono=` | GET | Filtered provider list with pagination |
| `/api/directory` | POST | Org registration submission |
| `/api/bookings` | POST | Create telehealth_booking |

### Guardian
| Route | Method | Description |
|---|---|---|
| `/api/guardian/create` | POST | Generate 32-byte token, INSERT guardian_controls |
| `/api/guardian/view/[token]` | GET | Return sanitized data (no relapse/triggers/flags) |
| `/api/guardian/revoke` | POST | Set `is_active=false` |
| `/api/guardian/encourage` | POST | Send encouragement notification |

### Guest
| Route | Method | Description |
|---|---|---|
| `/api/guest/chat` | POST | Claude chat, rate-limited to 20 msg/session (in-memory) |

### Admin
| Route | Method | Description |
|---|---|---|
| `/api/admin/metrics` | GET | All admin dashboard metrics |
| `/api/admin/seed?type=` | POST | Seed data (users/logs/providers/chat/guardians/bookings/demo/clear) |
| `/api/admin/providers/[id]/verify` | PATCH | Verify or reject a provider |
| `/api/admin/chat/[id]/delete` | DELETE | Soft-delete flagged chat message |

### Provider
| Route | Method | Description |
|---|---|---|
| `/api/provider/bookings` | GET | Provider-scoped bookings (joins profiles for alias) |
| `/api/provider/bookings/[id]` | PATCH | Confirm/reschedule/cancel booking |
| `/api/provider/notes` | POST | Save encrypted session notes |
| `/api/provider/availability` | GET/PATCH | Fetch/update online/in_person/session_types/availability_slots |

---

## Admin Dashboard (`/admin`)

### Sidebar (`app/admin/_components/AdminSidebar.tsx`)
- Logo in `text-amber-700` + search bar
- Nav: Dashboard (grid), Recovery (cross), Community (people), Telehealth (calendar), Moderation (shield), Appointments (calendar), Programs (chart), Settings (gear)
- Active state: green `bg-secondary-container text-on-secondary-container`
- Bottom: PANIC red pill | Support | Logout

### Dashboard Page (`app/admin/page.tsx` — Server Component)
Fetches all data server-side via `SUPABASE_SERVICE_ROLE_KEY` and passes to `DashboardClient`:

| Section | Component |
|---|---|
| Header | "System Overview" amber-800 + "LIVE STATUS: OPTIMAL" green badge |
| Metrics | Total Users (+12%↑), Panic Events (red border "Real-time"), Active Streaks (Avg Xd amber), Provider Queue (blue border "Pending") |
| Regional Map | Stylized Ethiopia SVG with bubble overlays for Addis Abeba/Hawassa/Dire Dawa |
| Moderation Queue | Flagged messages with DELETE/IGNORE buttons + "View All Flagged (N)" link |
| 30-Day Chart | Recharts BarChart — CHECK-INS (amber) + PANIC (red) |
| Provider Table | ENTITY (initials + name) / TYPE (MEDICAL blue / SPIRITUAL amber / COMMUNITY green) / ACTION (VERIFY button) |

### Provider Approval (`/admin/providers`)
- Filter: All / Pending (count) / Verified (count)
- Search + Type dropdown
- Enhanced `ProviderReviewCard` with: full bio, availability (Hybrid/Online/In-person), pro-bono badge, documents, ✅ Verify / ❌ Reject with toast notification

### Moderation (`/admin/moderation`)
- List of flagged messages with select-all checkboxes + bulk delete
- Each message: flag badge (AGGRESSIVE red / SPAM amber / INAPPROPRIATE purple), alias, time ago, truncated text
- 🗑 Delete (soft-delete) / ✓ Clear Flag buttons

### Seed Data (`/admin/seed`)
7 seed buttons + Reset Demo + ⚠ CLEAR ALL DATA (confirmation required):
1. Seed Demo Users (25)
2. Seed 60-Day Habit Logs
3. Seed Provider Directory
4. Seed Chat Messages
5. Seed Guardian Links
6. Seed Telehealth Bookings
7. Reset Demo Account

Features: current stats bar, toast notifications, "Seed All Data" button, loading spinners per button.

---

## Provider Dashboard (`/provider/dashboard`)

### Header
- Avatar initials (amber circle) + name + specialty + ✅ Verified badge

### Stats Row
Today's Appointments | This Week | Total Sessions | Rating

### Today's Schedule (Timeline)
- Hourly slots 8:00–18:00
- Each booking card: anonymous alias, session type badge (Initial blue / Follow-up purple / Crisis red), duration pill, status (Confirmed/Pending/Completed), **Join Session** green button

### Upcoming Appointments
- Scrollable list: date + alias + type + duration
- Actions: **Confirm** (green) / **Reschedule** (amber, prompts datetime) / **Cancel** (red)

### Session Notes
- Textarea linked to selected booking
- Save button + encrypted disclaimer

### Availability Settings
- Weekly calendar grid (Mon–Sat × 8:00–18:00, clickable green slots)
- Session types checkboxes (Initial / Follow-up / Crisis)
- Online / In-person toggles with Hybrid indicator

---

## Guardian View (`/guardian/[token]`)

No auth required — token-gated access. Public route in middleware.

| Section | Details |
|---|---|
| Top Nav | SafeGround logo | Amharic/English toggle | PANIC red button | Profile avatar |
| Hero | "Supporting {alias}" centered + subtext |
| Streak Card | text-8xl amber number + "Days of Strength" + "✓ Safety Plan Active" |
| Mood Flow | STEADY/IMPROVING badge + Recharts LineChart (amber-800 line) + caption |
| Encouragement | 3 cards: pink (encourage) / green (calm) / yellow (faith) — sends notification via API |
| Learning | Khat Recovery guide + Support Group + quote panel |
| Footer | Privacy/Terms + Emergency Support button + Shield + Lock icons |

**Error state**: Invalid/expired token → "Link Not Active" with Shield icon.

---

## Organization Flows (`/org`)

### Registration (`/org/register` — public)
4-step form:
1. Organization name, type (NGO/Religious/Healthcare/University), reg#, country, city
2. Contact name, email, phone, role
3. Services (checkboxes), languages, online/in-person/pro-bono, fee
4. File upload (registration certificate)

Submit → `POST /api/directory` → `is_verified=false` → admin queue → confirmation screen.

### Wellness Portal (`/org/portal` — auth required)
- Metric cards: Participants, Appointments, Programs, Engagement Rate
- Upcoming Appointments list (anonymized aliases)
- Platform Health: progress bars for Completion Rate, Attendance, Satisfaction
- Program Schedule with week progress (e.g. "Week 4 of 12")

---

## Seed Data System

### Standalone Script (`scripts/seed.ts`)
```bash
npx tsx scripts/seed.ts              # Run all seed types
npx tsx scripts/seed.ts users logs   # Run specific types
npx tsx scripts/seed.ts clear        # Clear all data
```

Loads `.env.local` manually (no dotenv dependency). Uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`.

What it seeds:
| Entity | Count | Details |
|---|---|---|
| Profiles | 26 | 25 seed + 1 demo (Biruk-Eagle-28) |
| Habit Logs | ~1560 | 60 days × 26 users, realistic mood sine waves, 2-3 relapses each |
| Providers | 9 | 8 verified + 1 pending |
| Chat Messages | 50 | Mix of text/milestone_shares, 1 flagged as aggressive |
| Guardians | 3 | 2 seed + 1 for demo with known token |
| Bookings | 5 | 4 seed + 1 demo (Dr. Hiwot, tomorrow 10AM) |
| Faith Program | 1 | Demo enrolled in Restoration Fellowship Week 4 |

**Demo Account** (`Biruk-Eagle-28`):
- 28-day current streak
- No log submitted for today (judges see the form live)
- Guardian token: `demo-guardian-token-safeground-2024`
- Booking: Dr. Hiwot Bekele, tomorrow 10:00 AM
- Faith program: Restoration Fellowship, Week 4

### API Seed Route (`POST /api/admin/seed?type=`)
Same functions as the standalone script but accessed via admin API. Requires admin auth (email in `ADMIN_EMAILS`).

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here   # Admin operations
GEMINI_API_KEY=your_gemini_api_key_here                 # Gemini AI
GEMINI_MODEL=gemini-2.0-flash                           # AI model
ADMIN_SECRET_KEY=your_admin_secret_key_here             # Admin secret
ADMIN_EMAILS=admin@example.com,superadmin@example.com   # Admin access
NEXT_PUBLIC_SITE_URL=http://localhost:3000              # Site URL
```

---

## Build & Run

```bash
npm install
cp .env.local.example .env.local   # Fill in your values
npm run dev                         # Development server (http://localhost:3000)

# Alternative: pnpm
pnpm install
pnpm dev

# Type check
npx tsc --noEmit

# Seed demo data
npx tsx scripts/seed.ts

# Build for production
npm run build
npm start
```

---

## Dashboard Design System (v2 — June 2026)

All dashboards (admin, provider, org portal) share a common design language.

### Palette
- Background: `bg-[#f6f5f1]`
- Cards: `bg-white` with `border border-[#e5e0db]` and `shadow-sm`
- Left accent bars: `border-l-{amber|blue|green|purple}-500` on metric cards
- Text: `text-[#2c241f]` headings, `text-[#6f5b4e]` labels, `text-[#9a8a7d]` placeholders
- Amber accent: `#92400E` for primary buttons and active states

### Spacing
- Max container: `max-w-6xl mx-auto`
- Padding: `px-4 sm:px-5 py-5 sm:py-6`
- Card padding: `p-4` stats, `p-5` section cards
- Gap: `gap-3` grid, `gap-5` between sections
- Grid: `grid-cols-2 sm:grid-cols-4` stats, `xl:grid-cols-3` schedule+notes

### Components
- Metric Card: `border-l-4 border-l-{color} bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4`
- Section Card: `bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5`
- Badge (type): `text-[10px] font-semibold px-1.5 py-0.5 rounded` + type color
- Badge (status): `text-[10px] font-medium px-1.5 py-0.5 rounded` + status color
- Primary btn: `bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14]`
- Ghost btn: `bg-[#f6f5f1] text-[#6f5b4e] rounded-md text-xs font-semibold hover:bg-[#e5e0db]`
- Empty state: Icon + `text-xs text-[#6f5b4e] text-center py-6/10`
- Toast: `fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2`
- Loading: Centered spinning amber border ring
- Scrollbar: `.custom-scrollbar` thin 4px with `#d4c9be` thumb

### Key Files
- `/app/provider/dashboard/page.tsx`: Today schedule, upcoming, session notes, availability grid, booking trends chart
- `/app/org/portal/page.tsx`: Participant metrics, platform health bars, appointments list, program progress
- `/app/guest/page.tsx` → `GuestSanctuary`: Chat panel, right panel, panic FAB
- `/app/globals.css`: Custom scrollbar, dashboard utility classes

---

## Auth & Access Control (June 2026)

### Middleware (`lib/supabase/middleware.ts`)
| Path | Access |
|---|---|
| `/`, `/guest`, `/register`, `/login`, `/onboarding` | Public |
| `/guardian/*`, `/org/register` | Public (token-gated) |
| `/admin/*` | Auth required + email in `ADMIN_EMAILS` env var |
| `/dashboard/*`, `/settings/*`, `/provider/*`, `/org/portal/*` | Auth + `onboarding_done` check |
| `/provider/dashboard` | Auth + must have matching `providers.id` or `providers.user_id` |
| `/org/portal` | Auth + must have matching org-type provider (religious_org/ngo/uni) |

### Providers ↔ Auth Users
- `providers` table has **no FK** to `auth.users` — it's a standalone directory
- Provider API routes used `providers.id = user.id` (broken for auto-generated UUIDs)
- **New**: `user_id` column on `providers` (FK to `auth.users.id`, nullable)
- API routes now use `.or('id.eq.{uid},user_id.eq.{uid}')` — matches by either ID
- Admin can "Grant Access" on verified orgs: creates auth user + profile + sets `user_id`
- Migration: `supabase/migrations/01_add_provider_auth_columns.sql`

### Org Auth Flow
1. Org registers at `/org/register` (public, 4-step form)
2. POST `/api/directory` → stores in `providers` with `is_verified=false, is_active=false`
3. Admin approves in `/admin/providers` → sets `is_verified=true, is_active=true`
4. Admin clicks "Grant Portal Access" → creates auth user, links provider via `user_id`
5. Org logs in with their email + generated password → accesses `/org/portal`

### New API Routes
| Route | Method | Description |
|---|---|---|
| `/api/org/portal` | GET | Org portal metrics + appointments (auth-required, matches by email then user_id) |
| `/api/admin/providers/[id]/grant-access` | POST | Create auth user + link to provider (admin-only) |

---

# SafeGround — Complete MVP UX, Dashboard & Workflow Specification

> The following sections (12 → End) define the **end-to-end user experience, page-by-page layout, and demo flow** for the SafeGround MVP. They complement the technical reference above by specifying what each surface should look and feel like, what content lives on it, and how the user moves between surfaces during a recovery journey.

---

## 12. LANDING PAGE

### Purpose

Build trust, reduce shame, explain value, and drive anonymous onboarding.

---

### Navigation Bar

**Logo:** SafeGround

Menu Items:

* Home
* How It Works
* Recovery Tools
* Professional Support
* Faith Support
* About
* Login

Primary CTA:

* Start Anonymously

---

### Hero Section

**Headline**

SafeGround

Anonymous Recovery & Digital Well-Being Platform

**Subheadline**

A private, judgment-free space for Ethiopian youth seeking support for compulsive pornography use, digital well-being challenges, and recovery.

**Buttons**

* Start Anonymously
* Continue as Guest

**Trust Indicators**

* Anonymous by Design
* No Public Profiles
* No Ads
* Local Language Support
* Professional & Faith-Based Resources

---

### Problem Section

Many young people struggle silently with:

* Compulsive pornography use
* Shame cycles
* Relapse patterns
* Anxiety and stress
* Khat-related impulse spikes
* Isolation

SafeGround helps break the cycle through evidence-based support.

---

### Features Section

#### AI Recovery Dashboard

Track urges, mood, habits, and recovery progress.

#### Panic Button

Immediate intervention during high-risk moments.

#### Anonymous Support Rooms

Talk to peers without revealing identity.

#### Professional Directory

Connect with counselors and psychiatrists.

#### Faith Support

Join trusted faith-based recovery programs.

#### Guardian Support

Invite a trusted supporter.

---

### How It Works

Step 1 — Create Anonymous Identity

Step 2 — Complete Recovery Setup

Step 3 — Track Daily Habits

Step 4 — Use Panic Tools During Urges

Step 5 — Build Recovery Streaks

Step 6 — Access Support When Needed

---

### Footer

Privacy First

No Tracking

No Device Fingerprinting

No Public Profiles

SafeGround © 2026

---

# 13. USER ONBOARDING FLOW

## Screen 1: Language Selection

Choose Language:

* Amharic
* English
* Afaan Oromo
* Tigrinya

Continue

---

## Screen 2: Trigger Identification

Select your common triggers:

* Telegram
* Boredom
* Loneliness
* Stress
* Khat
* Alcohol
* Social Media
* Late Night
* Relationship Problems

Continue

---

## Screen 3: Recovery Preference

What kind of support do you prefer?

* Clinical
* Faith-Based
* Secular
* Mixed Approach

Continue

---

## Screen 4: Guardian Setup

Would you like a trusted person to support you?

* Skip
* Add Guardian

Continue

---

## Screen 5: Goal Setting

Choose your first goal:

* 7 Days
* 14 Days
* 30 Days
* 60 Days
* 90 Days

Complete Setup

---

# 14. MAIN USER DASHBOARD

Route:
`/dashboard`

---

## Header

Welcome Back

Alias:
QuietLion42

Current Streak:
14 Days 🔥

Longest Streak:
32 Days

---

## Recovery Score Card

Mood:
8/10

Stress:
4/10

Urge:
2/10

Recovery Status:
LOW RISK

Color:
Green

---

## Daily AI Insight

Today's Insight:

Your strongest urges occur between 10 PM and midnight.

Consider reducing phone use during those hours.

---

## Risk Prediction Card

If:

* Khat Used = True
* Hours Since Khat = 5

Display:

High-Risk Window Detected

Your khat crash period may increase urges.

Suggested Action:
Take a walk or open Panic Support.

---

## Progress Charts

### 30-Day Mood Trend

Line Graph

### 30-Day Stress Trend

Line Graph

### 30-Day Urge Trend

Line Graph

### Relapse Timeline

Calendar View

---

## Recovery Milestones

* 3 Days Badge
* 7 Days Badge
* 14 Days Badge
* 30 Days Badge
* 60 Days Badge
* 90 Days Badge

---

## Quick Actions

* Daily Check-In
* Panic Button
* Chat Room
* Find Counselor
* Faith Support
* Guardian Settings

---

# 15. DAILY CHECK-IN DASHBOARD

Route:
`/checkin`

---

## Mood Slider

1–10

---

## Stress Slider

1–10

---

## Urge Intensity Slider

0–10

---

## Khat Usage

Used Khat Today?

Yes / No

Hours Since Last Use

---

## Alcohol Usage

Used Alcohol Today?

Yes / No

---

## Trigger Selection

* Telegram
* Alone
* Night
* Stress
* Boredom
* Post-Khat
* Social Media
* Relationship Stress

---

## Relapse Question

Did a relapse occur today?

Yes / No

---

## Private Journal

Encrypted Notes

Optional

---

## AI Generated Reflection

Generated after submission

Example:

Today showed resilience despite elevated stress levels.

---

## Submit

Save Check-In

---

# 16. PANIC BUTTON DASHBOARD

Route:
`/panic`

Always Accessible

---

## Screen 1

Emergency Support Activated

Animated Breathing Circle

4

3

2

1

Repeat

---

## Screen 2

Immediate Grounding Exercise

Name:

* 5 things you see
* 4 things you hear
* 3 things you feel
* 2 things you smell
* 1 thing you taste

---

## Screen 3

AI Coping Challenge

Example:

* Drink Water
* Leave Current Room
* Walk For 2 Minutes
* Message Support Room

---

## Screen 4

Affirmation

An urge is temporary.

You do not need to act on it.

---

## Screen 5

Completion

You Held Your Ground

+1 Recovery Point

Current Streak:
15 Days

Badge Earned:
Urge Surfer

---

# 17. CHAT DASHBOARD

Route:
`/chat`

---

## Room Selection

* Global Support
* Crisis Room

---

## Chat Window

Anonymous Messages Only

Example:

QuietLion:
Today is difficult.

HopeRunner:
Keep going.

MountainSoul:
You're not alone.

---

## Reactions

❤️
🙏
🔥
💪

---

## Online Count

126 Members Online

---

## Safety Notice

Never share:

* Real Names
* Phone Numbers
* Social Media Accounts
* Addresses

---

## Moderation

Flag Message

Block Message

Report Abuse

---

# 18. TELEHEALTH DASHBOARD

Route:
`/support/professional`

---

## Filters

Language

City

Online

In Person

Free Services

Specialization

---

## Provider Card

Dr. Example

Psychiatrist

Languages:
Amharic
English

Specialties:
CSBD
Anxiety
Depression

Book Session

---

## Booking Flow

Step 1:
Select Provider

Step 2:
Choose Date

Step 3:
Choose Time

Step 4:
Confirm Booking

Step 5:
Receive Confirmation

---

## My Appointments

Upcoming Sessions

Past Sessions

Cancelled Sessions

---

# 19. FAITH SUPPORT DASHBOARD

Route:
`/support/faith`

---

## Directory

Orthodox Recovery Program

Verified

Enroll

---

## Program Details

Week 1:
Understanding Triggers

Week 2:
Accountability

Week 3:
Recovery Practices

Week 4:
Long-Term Growth

---

## Progress Tracker

Current Week:
3

Completed:
2/12

Completion:
17%

---

## Weekly Check-In

Submit Reflection

Continue Program

---

# 20. GUARDIAN DASHBOARD

Route:
`/guardian/[token]`

---

## Overview

Current Streak:
14 Days

Recovery Status:
Improving

---

## Weekly Mood Trends

Graph

No Personal Notes Visible

---

## Panic Activity

Last Panic Event:
2 Days Ago

No Additional Details

---

## Recovery Progress

Current Goal:
30 Days

Progress:
47%

---

## Alert Settings

Panic Alerts

Weekly Summaries

Relapse Notifications

---

## Access Controls

Guardian Access Active

Revoke Access

---

# 21. PROFILE DASHBOARD

Route:
`/profile`

---

## User Information

Alias

Language

Region

University (Optional)

Religion (Optional)

---

## Recovery Preferences

Support Type

Triggers

Goal

---

## Security Settings

Change Alias

Delete Data

Export Data

Manage Guardian

---

# 22. ADMIN DASHBOARD

Route:
`/admin`

---

## Platform Metrics

Daily Active Users

Weekly Active Users

Check-Ins Submitted

Panic Events

Bookings

Chat Activity

Faith Program Enrollments

Guardian Connections

---

## Provider Management

Pending Verification

Approved Providers

Rejected Providers

---

## Chat Moderation

Flagged Messages

Deleted Messages

Reports

---

## Analytics

Daily Active Users Graph

Panic Frequency Graph

Streak Distribution Chart

Recovery Completion Trends

---

## Demo Data Manager

Generate Sample Users

Generate Sample Logs

Generate Sample Chat Messages

Generate Sample Providers

---

# COMPLETE USER FLOW

Landing Page

↓

Anonymous Registration

↓

Onboarding

↓

Main Dashboard

↓

Daily Check-In

↓

AI Analysis

↓

Dashboard Update

↓

If High Risk

↓

Panic Button

↓

AI Coping Tasks

↓

Completion Reward

↓

Return Dashboard

↓

Optional Support Path

├── Anonymous Chat

├── Professional Counselor

├── Faith Program

└── Guardian Support

↓

Weekly Insights

↓

Milestone Achievements

↓

Long-Term Recovery Progress

---

# MOBILE NAVIGATION

🏠 Home

📊 Dashboard

🚨 Panic

💬 Chat

👤 Profile

---

# DESKTOP SIDEBAR

Dashboard

Daily Check-In

Panic Center

Chat Rooms

Professional Support

Faith Support

Guardian

Profile

Settings

Admin

Logout

---

# HACKATHON DEMO FLOW

Landing Page

→ Anonymous Signup

→ Onboarding

→ Dashboard

→ Daily Check-In

→ AI Insight

→ Panic Button

→ Coping Session

→ Chat Room

→ Telehealth Directory

→ Faith Program

→ Guardian Dashboard

→ Admin Dashboard

→ Success Story & Metrics Screen

This flow demonstrates every major SafeGround feature in a complete end-to-end recovery journey suitable for a 4–6 minute hackathon presentation.

---

# SafeGround — World-Class Dashboard Design Specification v3 (June 2026)

> Senior Product Designer / UX Architect / Dashboard Specialist / Full-Stack SaaS Architect.
> This section **enhances** all existing dashboards (User, Admin, Provider, Guardian, Organization) and defines a unified enterprise-grade design system inspired by Stripe, Linear, Notion, Vercel, Headspace, and BetterHelp. All existing functionality, routes, and workflows from sections 1–22 are preserved. The existing warm amber/sandstone palette (`#92400E`, `#f6f5f1`, `#e5e0db`, `#2c241f`, `#6f5b4e`, `#9a8a7d`) is **not replaced** — it is now the foundation of a polished, modern SaaS aesthetic.

---

## 23. GLOBAL DASHBOARD DESIGN SYSTEM (Unified)

One unified design system now powers **every** dashboard in the platform.

### 23.1 Shared Shell (every dashboard)

Every dashboard (User, Admin, Provider, Guardian, Organization) uses a **DashboardShell** that renders:

| Region | Component | Behavior |
|---|---|---|
| Left rail | Collapsible **Sidebar** | 64px collapsed / 256px expanded. Icon + label. Active route gets amber `#92400E` left border + light-amber background. |
| Top bar | **DashboardTopBar** | Sticky, 56px tall, white bg, `border-b border-[#e5e0db]`, shadow-sm on scroll. |
| Top bar (left) | Page title + breadcrumb | e.g. "Recovery Intelligence Center › Overview" |
| Top bar (center) | **GlobalSearch** (⌘K) | Opens command palette searching users, providers, bookings, messages, programs. |
| Top bar (right) | **NotificationCenter** (bell + unread dot) | Dropdown: in-app notifications grouped by Today / This Week. |
| Top bar (right) | **LanguageToggle** (Amharic / English) | Persists preference in `profiles.language`. |
| Top bar (right) | **DarkModeToggle** (sun/moon) | Persists in `localStorage`, toggles `.dark` class on `<html>`. |
| Top bar (right) | **UserMenu** (avatar + dropdown) | Profile, Settings, Help, Logout. |
| Bottom (mobile) | **BottomNav** | 5 icons: Home / Dashboard / Panic / Chat / Profile. |
| Floating (everywhere) | **PanicButton** | Red pill, fixed bottom-right, z-50, opens `/panic` modal. |

### 23.2 Sidebar (Role-Aware, Reusable)

A single `Sidebar` component is reused across roles — items are filtered by `role`:

- **User sidebar**: Dashboard, Daily Check-In, Panic, Chat, Professional, Faith, Guardian, Profile, Settings, Logout
- **Admin sidebar**: Dashboard, Recovery, Community, Telehealth, Moderation, Appointments, Programs, Analytics, Settings, Logout
- **Provider sidebar**: Dashboard, Schedule, Patients, Notes, Availability, Profile, Settings, Logout
- **Org sidebar**: Dashboard, Programs, Participants, Appointments, Reports, Profile, Settings, Logout
- **Guardian sidebar**: Overview, Trends, Encouragement, Resources, Settings, Logout

Active state: `bg-[#fdf6ed] text-[#92400E] border-l-4 border-l-[#92400E]`
Hover: `bg-[#f6f5f1]`
Logo: `text-[#92400E] font-semibold` + small leaf icon

### 23.3 Design Tokens (extends existing palette)

```css
/* Existing warm palette is preserved */
--bg-canvas:    #f6f5f1;
--bg-surface:   #ffffff;
--bg-subtle:    #fdf6ed;
--border:       #e5e0db;
--border-soft:  #efe9e2;
--text-primary: #2c241f;
--text-muted:   #6f5b4e;
--text-faint:   #9a8a7d;
--accent:       #92400E;     /* amber-800 */
--accent-hover: #a04e14;
--accent-soft:  #fdf6ed;
--success:      #16a34a;
--warning:      #d97706;
--danger:       #dc2626;
--info:         #2563eb;

/* New semantic tokens (role accents) */
--medical:      #2563eb;     /* blue-600 */
--spiritual:    #92400E;     /* amber-800 */
--community:    #16a34a;     /* green-600 */
--crisis:       #dc2626;     /* red-600 */

/* Dark mode (June 2026) */
.dark {
  --bg-canvas:    #14110f;
  --bg-surface:   #1c1815;
  --bg-subtle:    #221d19;
  --border:       #2c241f;
  --border-soft:  #3a302a;
  --text-primary: #f5efe8;
  --text-muted:   #b8a99a;
  --text-faint:   #8a7a6c;
  --accent:       #f59e0b;
  --accent-hover: #fbbf24;
  --accent-soft:  #2c241f;
}
```

### 23.4 Typography (Inter + Geist Mono)

- **Sans**: `Inter` (UI body, headings)
- **Mono**: `Geist Mono` (numbers in KPI cards, code, IDs)
- **Display**: `Inter` 600, used in hero metrics

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-display-2xl` | 48px / 1.05 | 600 | KPI hero numbers |
| `text-display-xl`  | 36px / 1.1  | 600 | Page titles |
| `text-display-lg`  | 28px / 1.2  | 600 | Section headers |
| `text-lg`          | 18px        | 500  | Card titles |
| `text-base`        | 14px        | 400  | Body |
| `text-sm`          | 13px        | 400  | Table cells |
| `text-xs`          | 11px        | 500  | Badges, labels, captions |
| `font-mono`        | tabular-nums | 500 | Numbers |

### 23.5 Spacing & Layout

- Max canvas: `max-w-[1440px] mx-auto`
- Page padding: `px-6 py-6 lg:px-8 lg:py-8`
- Section gap: `space-y-6` (24px)
- Card padding: `p-5` (20px) for content, `p-4` (16px) for compact cards
- Grid gaps: `gap-4` for KPI rows, `gap-6` for sections
- Sidebar width: 256px expanded / 64px collapsed
- Top bar: 56px
- Border radius: `rounded-xl` (12px) cards, `rounded-lg` (8px) buttons, `rounded-md` (6px) inputs

### 23.6 Component Library (shared, world-class)

| Component | Spec |
|---|---|
| **KpiCard** | `bg-white border border-[#e5e0db] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow` • 4px left accent bar (`border-l-4 border-l-{color}`) • Label (xs, muted) • Value (display-xl, mono, primary) • Delta chip (↑ green / ↓ red) • Sparkline (60px) |
| **SectionCard** | `bg-white border border-[#e5e0db] rounded-xl p-5 shadow-sm` with optional title row + actions |
| **ChartCard** | Section card with Recharts inside, 280–320px height, grid lines `#f1ece6`, tooltip `bg-white border-[#e5e0db]` |
| **DataTable** | `rounded-xl border border-[#e5e0db] overflow-hidden` • sticky header `bg-[#fdf6ed]` • zebra rows `hover:bg-[#fdf6ed]` • row actions menu (kebab) |
| **Skeleton** | `animate-pulse bg-gradient-to-r from-[#f6f5f1] via-[#efe9e2] to-[#f6f5f1]` |
| **EmptyState** | Centered: 64px icon (muted) + title (lg, primary) + description (sm, muted) + CTA button |
| **ErrorState** | Red icon + title + "Try again" button + error code (mono, faint) |
| **Toast** | `fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2` • success (green ✓), error (red ✕), info (blue ⓘ), warning (amber ⚠) |
| **Modal** | `bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6` with backdrop `bg-black/40 backdrop-blur-sm` |
| **Drawer** | Right-side, 480px wide, slide-in 240ms ease-out |
| **ButtonPrimary** | `bg-[#92400E] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#a04e14] active:scale-[0.98] transition` |
| **ButtonGhost** | `bg-transparent text-[#6f5b4e] hover:bg-[#f6f5f1] rounded-lg px-4 py-2 text-sm font-semibold` |
| **ButtonDanger** | `bg-[#dc2626] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#b91c1c]` |
| **Input** | `border border-[#e5e0db] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#92400E]/20 focus:border-[#92400E]` |
| **Badge** | `text-[10px] font-semibold px-2 py-0.5 rounded-full` with type/status color (12 variants) |
| **Avatar** | 40px circle, amber bg, white initials, ring on hover |
| **Tabs** | Underline style: active = `border-b-2 border-[#92400E] text-[#92400E]` |
| **Tooltip** | `bg-[#2c241f] text-white text-xs px-2 py-1 rounded shadow-lg` |
| **ProgressBar** | 6px height, `bg-[#f6f5f1]` track, `bg-[#92400E]` fill, animated width |
| **RingProgress** | SVG circular progress for streaks (amber stroke, soft track) |

### 23.7 Motion & Micro-Interactions

- Page transitions: 180ms ease-out fade
- Card hover: `transition-shadow duration-200 hover:shadow-md`
- Button press: `active:scale-[0.98] transition-transform duration-100`
- Number tickers: count-up animation 800ms (requestAnimationFrame)
- Skeleton → content: cross-fade 200ms
- Toast: slide-up + fade 240ms, auto-dismiss 4s
- Charts: data updates animate 600ms
- KPI delta arrows: green ↑ / red ↓ with 6px translateY bounce on load
- Framer Motion (optional dep): `AnimatePresence` for list reordering, modals, drawers
- `prefers-reduced-motion`: disable non-essential animation

### 23.8 Accessibility (WCAG 2.1 AA)

- Color contrast ≥ 4.5:1 (text) / 3:1 (UI) — verified on light & dark
- All interactive elements keyboard-navigable (Tab, Enter, Esc, ↑/↓)
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#92400E] focus-visible:ring-offset-2`
- ARIA labels on icon buttons, charts, live regions
- Screen reader text for sparklines, badges
- Form inputs: explicit `<label>` and error messages via `aria-describedby`

### 23.9 Role-Based Permissions

```
canSee('user-mgmt')      → admin only
canSee('audit-logs')     → admin only
canSee('session-notes')  → provider (own) + admin
canSee('guardian-data')  → guardian (own token) + user
canSee('org-metrics')    → org admin + super admin
canSee('private-journal')→ user only — NEVER exposed via API
```

### 23.10 Real-Time & Notifications

- Supabase Realtime subscriptions on: `habit_logs`, `panic_events`, `chat_messages`, `bookings`, `guardian_notifications`
- Reconnecting WebSocket indicator in top bar
- In-app notification center groups: Today, This Week, Earlier
- Bell badge shows unread count (red dot)
- Optional browser push (future) via service worker

---

## 24. USER DASHBOARD — "Recovery Intelligence Center"

Route: `/dashboard`
Auth: required + `onboarding_done`
Layout: 12-col grid, max-w-7xl, with collapsible left sidebar.

### 24.1 Top Header Bar (sticky)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ☰  Recovery Intelligence Center        🔍 ⌘K  🌐 AM/EN  🌙  🔔 3  [QL avatar] │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **Greeting**: "Good morning, QuietLion42" (changes by time of day)
- **Breadcrumb**: Dashboard › Overview
- **Quick KPI strip on header** (right of title): 14d streak 🔥 • Goal 30d (47%) • Recovery 78/100
- **Global search** (⌘K): finds users (admin), messages, providers, programs
- **Notification bell**: dropdown with grouped items
- **Avatar menu**: Profile · Settings · Help · Sign out

### 24.2 Hero Recovery Card (full width, 12 col)

```tsx
<HeroCard>
  <left>  <h1>14 days of strength</h1>
          <p>You're closer to your 30-day goal.</p>
          <ProgressRing value={47} size={120} />
          <span>14 / 30 days</span>  </left>
  <center> <RecoveryScoreGauge score={78} /> </center>
  <right>  <StreakFlame days={14} />  <CurrentGoal />  <NextMilestone />  </right>
</HeroCard>
```

- Background: subtle amber gradient `from-[#fdf6ed] to-white`
- Animated flame icon (CSS pulse)
- Recovery Score 0–100 with delta vs. last week
- "View details" link → scrolls to analytics

### 24.3 KPI Row (4 cards, 3 col each on lg)

| Card | Icon | Value | Sub | Accent |
|---|---|---|---|---|
| Current Streak | 🔥 | 14 days | +2 vs last week | amber |
| Longest Streak | 🏆 | 32 days | Personal best | amber |
| Recovery Score | 💎 | 78 / 100 | ▲ 6 this week | amber |
| Goal Completion | 🎯 | 47% | 16 days remaining | blue |
| Total Clean Days | ✨ | 187 days | Lifetime | green |
| Weekly Progress | 📈 | 6/7 check-ins | Strong week | green |

Each card: hover lifts `shadow-md`, sparkline (60×24px) in corner.

### 24.4 AI Recovery Insights (2-col, 6/6)

**Left — Insight feed** (chronological, latest on top):
- 🧠 "Your strongest urges occur between 10 PM and midnight — try a phone-free wind-down routine."
- ⚠️ "Khat crash window detected: 5h since use. Risk is elevated for ~90 min."
- ✨ "Today showed resilience despite elevated stress (7/10). Keep protecting the streak."
- 💪 "You've hit 14 days — most users who reach this point stay clean 6+ months."

Each insight has: icon, time-ago, body, "Take action" link (e.g. opens Panic or sets reminder).

**Right — Risk Prediction Card**:
- Risk score 0–100 with color band (green <40, amber 40–70, red >70)
- Top 3 risk factors: "Late-night phone use", "Khat use 5h ago", "Stress 7/10"
- Suggested actions: 3 quick buttons (Walk, Open Panic, Message Guardian)

### 24.5 Advanced Analytics (3 charts row, 4/4/4)

| Chart | Type | Window | Accent |
|---|---|---|---|
| Mood Trend | Recharts AreaChart | 30d | amber-500 |
| Stress Trend | Recharts LineChart, smooth | 30d | orange-500 |
| Urge Intensity | Recharts BarChart | 30d | red-500 |
| Recovery Score | Recharts RadialBar | 30d | amber-700 |
| Relapse Timeline | Recharts ScatterChart on calendar | 90d | red-600 |
| Trigger Frequency | Recharts HorizontalBar | 30d | purple-500 |

All charts: tooltip with date+value, grid `#f1ece6`, hover crosshair, smooth animation on mount, "Last 7d / 30d / 90d" range tabs above.

### 24.6 Activity Timeline (full width)

Reverse-chronological feed of user's actions:
- ✅ Check-in submitted · Mood 8/10 · 2h ago
- 🚨 Panic session completed · Streak protected · Yesterday
- 🏅 Milestone: 14 days clean · 2 days ago

---

# SafeGround — v0.app Build Playbook & Team Prompt Series

> Ethiopian Youth Digital Well-Being Platform — 4-Day Hackathon Sprint
>
> **Stack:** Next.js 14 · Supabase · Claude AI · Tailwind · shadcn/ui
> **Deploy:** Vercel (single command)
> **Design Source:** Google Stitch — 19 screens
> **Teams:** Team A (User-Facing) · Team B (Admin & Backend)
> **Total v0 Prompts:** 12 prompts across 2 teams
> **Build Duration:** 4 days / 96 hours

---

## PART 1 — PROJECT SETUP PROMPT

Send this single prompt first — before splitting into teams. It scaffolds the entire project.

### 🚀 PROMPT 0 — Project Scaffold (Send Once, Before Teams Split)

Copy and paste the following prompt into v0.app:

```
You are a senior Next.js 14 engineer. Scaffold the complete SafeGround project — a
privacy-first digital well-being platform for Ethiopian university students.

DESIGN LANGUAGE (from Stitch mockups — match exactly):

  Primary brand:  Amber/warm brown  (#92400E, #78350F, amber-600/800)
  Danger/Panic:   Deep red           (#B91C1C, red-700)
  Success:        Forest green       (#166534, green-700)
  Background:     Warm cream         (#FAFAF9, stone-50)
  Cards:          White with subtle shadow (shadow-sm)
  Typography:     Geist Sans (body) + Noto Serif Ethiopic (accent headings)
  Panic button:   Fixed red pill, always visible, bottom-right on mobile,
                  left sidebar on desktop

GENERATE THIS EXACT FILE & FOLDER STRUCTURE:

safeground/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + bottom nav + panic button
│   │   ├── dashboard/page.tsx
│   │   ├── log/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── directory/page.tsx
│   │   ├── spiritual/page.tsx
│   │   └── settings/guardian/page.tsx
│   ├── guardian/[token]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers/page.tsx
│   │   ├── moderation/page.tsx
│   │   └── seed/page.tsx
│   ├── guest/page.tsx              ← anonymous sanctuary
│   ├── api/                        ← all server routes (see PART 4 B1)
│   ├── layout.tsx                  ← root layout, fonts, global providers
│   └── page.tsx                    ← public landing page
├── components/
│   ├── ui/                         ← shadcn/ui auto-generated
│   ├── layout/                     ← Sidebar, BottomNav, PanicButton
│   ├── dashboard/                  ← StreakCard, MoodChart, AffirmationCard, KhatRiskBanner
│   ├── log/HabitLogForm.tsx
│   ├── panic/                      ← PanicModal, BreathingCircle, CopingStepCard
│   ├── chat/                       ← ChatRoom, MessageBubble, ChatInput, RoomSelector
│   ├── directory/                  ← ProviderCard, BookingFlow
│   ├── spiritual/                  ← FaithOrgCard, SpiritualCompanion
│   ├── guardian/                   ← GuardianSetupWizard, GuardianDashboard
│   └── admin/                      ← MetricCard, ProviderReviewCard, FlaggedMessageCard
├── lib/
│   ├── supabase/                   ← client.ts, server.ts
│   ├── ai/claude.ts
│   ├── utils/                      ← aliasGenerator, streakUtils, khatRiskDetector
│   └── types/index.ts              ← all shared TypeScript types
├── middleware.ts                   ← route protection + auth checks
├── .env.local.example
├── tailwind.config.ts
└── package.json

DEPENDENCIES TO INSTALL:
  @supabase/supabase-js @supabase/ssr
  @anthropic-ai/sdk
  recharts framer-motion lucide-react
  shadcn/ui (button, card, badge, dialog, progress, tabs, toast, slider)
  qrcode.react

GENERATE THESE STARTER FILES WITH FULL CODE:
  1.  app/layout.tsx          — root layout with Noto Serif Ethiopic + Geist fonts
  2.  middleware.ts           — protect /dashboard/*, /admin/*, allow /guest, /guardian
  3.  lib/supabase/client.ts  — createBrowserClient
  4.  lib/supabase/server.ts  — createServerClient
  5.  lib/types/index.ts      — all types: Profile, HabitLog, Streak, Provider,
                                AnonymousChat, GuardianControl, TelehealthBooking
  6.  lib/utils/aliasGenerator.ts — Amharic-adjective + animal + number combos
  7.  components/layout/PanicButton.tsx — red fixed pill, opens PanicModal
  8.  components/layout/Sidebar.tsx    — desktop sidebar matching Stitch design
  9.  components/layout/BottomNav.tsx  — mobile 5-tab bottom navigation
  10. app/(dashboard)/layout.tsx      — wraps all dashboard pages
  11. tailwind.config.ts              — extend with amber/stone/forest palette
  12. .env.local.example              — all required env var keys

PANIC BUTTON EXACT SPEC (match emergency_panic_support_mobile screen):
  - On desktop: in sidebar, full-width red pill with asterisk * icon
  - On mobile: fixed bottom-right, circular red button, z-50
  - Label: 'PANIC' in white, bold
  - On click: open PanicModal full-screen overlay (do not navigate away)

ALIAS GENERATOR SPEC:
  Amharic adjectives (latinized): Selam, Biruk, Tsega, Fiker, Tena,
    Nitsuh, Haile, Abebe, Genet, Abenezer, Chora
  Animals: Lion, Eagle, Crane, Gazelle, Wolf, Falcon, Cheetah,
    Ibis, Eland, Jackal, Otter, Dove
  Format: [Adjective]-[Animal]-[2-digit-number]
  Example: 'Abenezer-Crane-68'  (matches Stitch join screen)

Output all files with complete, working TypeScript code. No placeholders.
```

---

## PART 2 — TEAM DIVISION

| Team | Responsibility |
|---|---|
| **TEAM A — User Experience** | All user-facing pages: Landing, Auth, Dashboard, Log, Panic, Chat, Directory, Spiritual, Guardian |
| **TEAM B — Platform & Admin** | Admin dashboard, Provider portal, Organization flows, Clinical dashboard, Seed data, API routes |

| Pages → Team A | Pages → Team B |
|---|---|
| `/` — Landing (public) | `/admin` — System Overview Dashboard |
| `/guest` — Anonymous Sanctuary | `/admin/providers` — Approval Queue |
| `/register` — Join Anonymously | `/admin/moderation` — Chat Moderation |
| `/onboarding` — 5-Step Wizard | `/admin/seed` — Demo Data Panel |
| `/dashboard` — Recovery Hub | `/guardian/[token]` — Guardian View |
| `/log` — Daily Habit Check-in | Organization Registration Page |
| `/panic` — Emergency Support | Organization Wellness Portal |
| `/chat` — Community Healing Spaces | Clinical Provider Dashboard |
| `/directory` — Support Directory | Organization Approval Center |
| `/spiritual` — Spiritual Support Hub | All `/api/*` route handlers |
| `/settings/guardian` — Link Setup | Database seed script |

---

## PART 3 — TEAM A PROMPTS (User Experience)

Team A sends prompts A1 through A6 in sequence. Each prompt builds on the previous.

### TEAM A — PROMPT A1: Landing Page + Auth Flow

You are building SafeGround, a privacy-first well-being platform for Ethiopian university students. Build the following 3 pages matching the Stitch design exactly.

**DESIGN REFERENCE (safeground_home screen):**
- Background: stone-50 (#FAFAF9), warm cream
- Nav: 'SafeGround' logo in amber-800, nav links in stone-600, PANIC button in red-700 (always right side of nav)
- Hero: 'Your Journey is Private.' — 'Private.' in amber-600 italic, subtitle: 'A digital hearth for university students in Ethiopia', Buttons: 'Start Anonymously' (amber filled) + 'How it Works' (outline)
- Stats: '15k+ Active Students' | '100% Data Sovereignty' | '24/7 Crisis Response'
- Feature grid: AI Recovery Paths | Panic Support (dark red card) | Anonymous Chat (green card) | Faith Integration
- Testimonials: 'Voices of Healing' section with student quotes
- University logos: AAU, ASTU, JU, MU, HU
- Privacy FAQ: accordion with 3 questions

**PAGE 1 — `app/page.tsx` (Landing)**
Full marketing landing page matching Stitch design.
CTA 'Start Anonymously' → `/register`
'How it Works' → scrolls to features section

**PAGE 2 — `app/(auth)/register/page.tsx` (Join Anonymously)**
DESIGN REFERENCE (safeground_join_anonymously screen):
- Header: 'Your healing journey starts privately.' (with 'privately.' in amber-600 italic)
- Language selector: 4 pill buttons — English (selected/green) | አማርኛ Amharic | Oromifa | ትግርኛ Tigrinya
- Anonymous alias box: shows generated alias (e.g. 'Abenezer-Crane-68') with refresh/regenerate icon button
- 'The Seal of Trust' green info card: privacy explanation
- Buttons: 'Exit SafeGround' (ghost) | 'Begin Your Recovery →' (amber filled)
- Footer trust badges: Local Encryption | Zero-Log Policy | Private Keys
- On 'Begin Your Recovery': create anonymous Supabase session → `/onboarding`

**PAGE 3 — `app/(auth)/onboarding/page.tsx` (Guided Onboarding)**
DESIGN REFERENCE (safeground_guided_onboarding screen):
- Header badge: 'ONBOARDING JOURNEY' label + '1 / 5' counter
- Green progress bar showing current step
- '256-bit Encrypted Session' badge top right
- Step 1: 'Choose your heart's language' — 4 language cards in 2x2 grid (language name + script + globe/flag icon)
- Step 2: Trigger Identification — multi-select tags (boredom, stress, loneliness, late_night, telegram, social_media, post_khat, fatigue, after_alcohol)
- Step 3: Support preference radio — Secular | Faith-Based | Clinical
- Step 4: Guardian opt-in — 'Would you like a trusted person to support you?' Yes (sets up guardian flow) | Not yet
- Step 5: Goal setting — streak target slider + personal affirmation input
- Footer: 'ZERO-LOG ARCHITECTURE' | 'VERIFIED BY UNIVERSITY PARTNERS'
- On complete: POST `/api/auth/profile` → redirect `/dashboard`

**STYLING RULES:**
- Use Noto Serif Ethiopic for Amharic script (import from Google Fonts)
- All amber-600 CTAs, stone-50 background, white cards with shadow-sm
- PanicButton component always rendered (imported from components/layout)

### TEAM A — PROMPT A2: Dashboard + Daily Habit Log

Build the Recovery Dashboard and Daily Habit Log for SafeGround.

**PAGE 1 — `app/(dashboard)/dashboard/page.tsx`**
DESIGN REFERENCE (safeground_anonymous_guest_sanctuary — right panel):
Layout: sidebar on desktop, bottom nav on mobile (already in layout.tsx)
- Session badge top: 'Session: SG-ANON-7742' | 'PRIVACY ACTIVE' green badge

**StreakCard.tsx:**
- Large animated number: current_streak days
- 'Days of Strength' subtitle + 'Safety Plan Active' green badge
- Sub-stats: longest_streak | total_clean_days
- Milestones 3/7/14/30/60/90: framer-motion confetti animation

**MoodChart.tsx:**
- Recharts AreaChart — 30 days
- Two lines: mood_score (amber) + urge_intensity (red)
- Milestone reference lines at 7, 14, 30 days
- X-axis: dates, Y-axis: 0-10

**Today's Check-In CTA card** — shows if log not yet submitted today

**AffirmationCard.tsx:**
- Skeleton loader while fetching
- Warm amber-50 card, italic affirmation text
- Refresh icon to regenerate
- POST to `/api/ai/affirmation` with today's context
- Fallback: array of 20 static affirmations

**KhatRiskBanner.tsx:**
- Appears only if: `khat_used_today=true` AND `khat_hours_ago 4-9`
- Red-orange warning card: 'Based on your log, you may be entering a high-risk window. Your coping skills are strongest right now.'
- Panic button shortcut inside the banner

**Immediate Relief quick-actions** (match guest sanctuary right panel):
- 'Breathing Technique' card (green): '4-7-8 method for calm'
- 'Grounding Exercise' card (amber): '5-4-3-2-1 technique'

**Echoes of Support** (read-only rotating quotes from community)

**PAGE 2 — `app/(dashboard)/log/page.tsx` (HabitLogForm.tsx)**
- 'How is your heart today?' heading (match guest sanctuary screen)
- Mood emoji picker: 5 face emojis (😞😐🙂😊✨), tap to select
- Stress slider: 1-10 with labels 'Calm' to 'Overwhelmed'
- Urge intensity: 4 tap targets: None / Low / Medium / High
- Relapse toggle: confirmation AlertDialog before recording
- Context flags section:
  - ☐ Khat used today → if yes, show 'How many hours ago?' number input
  - ☐ Alcohol used today
- Trigger tags multi-select chips (9 options from spec)
- Notes textarea: 'Stays on your device only — never uploaded'
- Submit: 'Save Today's Check-in' → POST `/api/habits/log` → update streak

**API ROUTES TO CREATE:**
- `POST /api/habits/log` — insert habit_log row, trigger streak update
- `GET  /api/habits/streak` — return streak data for current user
- `POST /api/ai/affirmation` — call `claude-sonnet-4-20250514`, return affirmation

Claude system prompt:
> 'You are a compassionate recovery companion for Ethiopian university students. Generate a single culturally respectful, non-religious-defaulting daily affirmation (2-3 sentences) based on the user's mood and urge intensity. Use metaphors of strength, nature, and academic focus. Output ONLY the affirmation text, nothing else.'

### TEAM A — PROMPT A3: Panic Engine (Emergency Support)

Build the complete Panic Button and Emergency Intervention system.

DESIGN REFERENCE: emergency_panic_support_mobile screen

**COMPONENT: `components/panic/PanicModal.tsx`**
Full-screen overlay that opens when PANIC button pressed. Three phases — render sequentially:

**PHASE 1 — Breathing Circle (BreathingCircle.tsx):**
Match exact design: large concentric circle, center text 'Inhale'/'Hold'/'Exhale'
4-7-8 pattern: Inhale 4s → Hold 7s → Exhale 8s
Timer badge top-left: red pill 'Urge Active' + clock showing 06:58
Bottom: 'Breathe with us.' heading
Timing pills: 'In: 4s' | 'Hold: 7s' | 'Out: 8s'
CSS animation: circle pulses/expands on inhale, contracts on exhale
Auto-advance to Phase 2 after 2 full breath cycles (38 seconds)

**PHASE 2 — Urge Surfing Guide (CopingStepCard.tsx):**
'Urge Surfing Guide' heading + 'Step 1 of 5' counter (top right)
Card with amber icon + 'Step 1: Grounding' label in amber
Large heading: '5 Things You See'
Instruction text below
Bottom: 'I'm feeling better, Cancel Intervention' text link
5 steps total (fetched from /api/panic):
  1. Grounding — 5 Things You See
  2. Breathing — 4-7-8 Reset
  3. Distraction — Physical Movement
  4. Connection — Reach for Support
  5. Affirmation — Your Strength Statement
Each step has a 90-second timer bar

**PHASE 3 — Completion:**
'You Held Your Ground 🌟' celebration screen
Streak protected badge: amber confetti animation (framer-motion)
Current streak displayed prominently
'Return to Dashboard' button

**API: `POST /api/panic`**
Body: `{ user_id, intensity (0-10), context_tags[] }`
1. INSERT panic_event into habit_logs (`ai_intervention_triggered=true`)
2. Call Claude API for coping task:
   System: 'You are a CBT urge-surfing coach for Ethiopian students. Generate 5 grounding steps for immediate crisis intervention. Return JSON: { steps: [{title, instruction, duration_seconds}], affirmation: string }'
3. Async: check guardian_controls, queue notification if alert_on_panic=true
4. Return: `{ session_id, steps[], affirmation, breathing_duration }`

**API: `POST /api/panic/complete`**
Body: `{ session_id, completed_steps }`
Update streak: mark as 'held_ground' (no relapse), INSERT milestone

**LOCALSTORAGE KEYS (zero server trace):**
- `safeground_panic_active`: boolean
- `safeground_panic_start`: timestamp
- `safeground_panic_step`: current step index

### TEAM A — PROMPT A4: Community Chat (Healing Spaces)

Build the Anonymous Community Chat Room.

DESIGN REFERENCE: safeground_community_support_chat_1 and _2 screens

**PAGE: `app/(dashboard)/chat/page.tsx`**

LAYOUT (match chat_1 screen exactly):
- Left panel (280px): 'Healing Spaces' / 'Select a community room'
- 3 room options:
  - **Global Support** — green active state, '42 active members'
  - **Crisis Room** — asterisk * icon, 'Immediate attention'
  - **Faith Support** — cross icon, 'Grounded in faith'
- Bottom of left panel: Privacy Policy | Chat Settings

- Right panel: Chat area
  - Header: room name + '42 people here now' (green dot) + 'Share Milestone' amber button (top right)
  - Message types (match chat_1 screenshots):
    - **text**: left-aligned dark bubble (others), amber-600 right (you)
    - **milestone_share**: special center card — green border, 🏆 icon, 'Milestone Celebration!' heading, italic quote, '— Anonymous Soul', emoji reactions row
    - **support_reaction**: inline emoji burst (👊 💚 🙏)
  - Reaction counts shown below messages (e.g. '👊 12  💚 8')
  - 'TODAY' date separator pill

- Bottom input bar:
  - + icon (attach/extras) | 'Share your journey anonymously...' placeholder
  - Send button (green circle, arrow icon)
  - Below bar: 'Feeling' | 'Fully Ghost Mode' toggles + 'Messages are encrypted and ephemeral.' right-aligned

**SUPABASE REALTIME:**
- Subscribe to `anonymous_chat` WHERE room_id=eq.{currentRoom}
- Use Supabase Presence for live user count
- Insert messages directly from browser client (not via API)
- Auto-scroll to bottom on new message
- 'Fully Ghost Mode': hide own alias, show as 'Anonymous'

**ALIAS:** use `lib/utils/aliasGenerator.ts`, store in `sessionStorage`
- Each page load gets fresh alias. 'Fully Ghost Mode' replaces with 'Anonymous'

**MILESTONE SHARE DIALOG:**
- Opens when 'Share Milestone' clicked
- 'Today marks N days of growth and resilience.'
- 'Thank you SafeGround community for being my anchor.'
- User can edit before sending. Submits as `message_type='milestone_share'`

### TEAM A — PROMPT A5: Support Directory + Spiritual Hub

Build the Support Directory and Spiritual Hub pages.

**PAGE 1 — `app/(dashboard)/directory/page.tsx`**
DESIGN REFERENCE: safeground_support_directory screen

LAYOUT:
- Header: 'Healing through Connection'
- Subtext: 'Find a path forward with culturally responsive clinical care or grounded spiritual guidance. Your journey is private and secure.'
- Tab bar: 'Clinical Support' (active) | 'Faith-Based Programs'

FILTER BAR (white card):
- City or Region: location pin icon + text input
- Language: dropdown (Any Language | Amharic | English | Oromifa | Tigrinya)
- Session Type: 'Online' | 'In-person' toggle pills
- Pro-bono only: toggle switch

PROVIDER CARDS (3-column grid, match directory screen exactly):
- Profile photo (rounded, full bleed top)
- Badge: 'Verified' (green) or 'Faith Support' (amber) — top-right overlay
- Name (large, bold) + type badge (PSYCHIATRIST | COUNSELOR | CHURCH-LED)
- Languages: green globe icon + language names
- Bio excerpt (2 lines, truncated)
- Price: amber '$120 / session' or 'Free (Pro-bono)'
- Mode: laptop icon + 'Online' or 'In-person'
- CTA: 'Book Session' (amber filled) or 'Join Program' (green outline)

BOOKING FLOW MODAL (BookingFlow.tsx):
- Step 1: Date picker → available dates highlighted
- Step 2: Time slot grid (30-min slots)
- Step 3: Optional notes textarea
- Step 4: Confirmation — provider name, date, time, meeting link
- POST `/api/bookings` to save

Pagination: page numbers at bottom (1, 2, 3... 12) matching design

**PAGE 2 — `app/(dashboard)/spiritual/page.tsx`**
DESIGN REFERENCE: spiritual_support_hub screen

LAYOUT:
- Sidebar nav: Programs | Dashboard | Recovery | Community
- Main area: 'Path of Restoration' pill badge
- 'Week 4: Anchoring in Faith' heading
- Progress: 'Overall Progress' bar + 'Week 4 of 12' label
- 4 milestone bars below (weeks segmented)

WISDOM COMPANION panel (right):
- Avatar + 'Wisdom Companion' heading + 'FAITH-GUIDED AI' badge
- Quote card: italic wisdom text
- 'Seek Guidance →' amber button
- Opens AI companion chat (POST `/api/faith/companion`)

SCRIPTURE/REFLECTION section (center):
- Amharic scripture text in Noto Serif Ethiopic (large, centered)
- English translation in italic below
- 'Your Reflection' label + textarea
- 'Save Entry' button

Faith tab in directory: filter providers WHERE type IN ('religious_org','religious_individual')
Denomination filter pills: All | Orthodox | Protestant | Muslim

API: `GET /api/directory?type=&city=&language=&online=&pro_bono=`
API: `POST /api/bookings`
API: `POST /api/faith/companion` (Claude AI, 200 tokens, multi-faith system prompt)

### TEAM A — PROMPT A6: Guest Sanctuary + Guardian Settings

Build the Anonymous Guest Sanctuary and Guardian Link pages.

**PAGE 1 — `app/guest/page.tsx` (Anonymous Sanctuary)**
DESIGN REFERENCE: safeground_anonymous_guest_sanctuary screen

LAYOUT:
- Top bar: 'SafeGround' logo | 'Session: SG-ANON-7742' badge | 'PRIVACY ACTIVE' green badge | profile icon

LEFT PANEL — AI Recovery Support Chat:
- 'Recovery Support' header + 'Anonymous & Secure' + green dot
- Chat messages: SafeGround AI (amber left bubble) / User (green right bubble)
- Message metadata: 'SafeGround AI • Just now' | 'You • 1m ago'
- Encrypted disclaimer: 'This session is encrypted and will not be saved unless you upgrade.'
- Input: 'Type your thoughts...' + green send button
- Chat to Claude via POST `/api/guest/chat` (no auth required)
- System prompt: 'You are SafeGround AI. A warm, anonymous, non-judgmental recovery support companion for Ethiopian students. Your first message is: "Welcome. You are safe and anonymous here. How are you feeling in this moment?" Keep responses under 100 words. Never mention pornography directly.'

RIGHT PANEL:
- 'How is your heart today?' — 5 emoji mood selector (same as dashboard)
- 'IMMEDIATE RELIEF' section:
  - Breathing Technique card (sage green)
  - Grounding Exercise card (amber/terracotta)
- 'ECHOES OF SUPPORT — READ ONLY' section:
  - 2 rotating quotes from community (pull from `anonymous_chat` milestones)
- 'Save Your Journey' dark amber CTA card:
  - 'Create a private account to track your moods...'
  - 'Create Private Account →' outlined button → `/register`

PANIC button: fixed bottom-right (circular, red, z-50)

**PAGE 2 — `app/(dashboard)/settings/guardian/page.tsx`**
DESIGN REFERENCE: guardian_support_view_1 (user side of guardian management)

GuardianSetupWizard.tsx — 3 steps:
- Step 1: Guardian alias + relationship selector (Parent | Sibling | Spouse | Mentor | Trusted Friend)
- Step 2: Monitoring level + alert toggles
  - 'Alert Only' | 'Weekly Summary' | 'Full View'
  - ☑ Notify on panic (default ON) | ☐ Notify on relapse | ☐ Streak breaks
- Step 3: Share access — generated URL + copy button + QR code (qrcode.react)
  - Pre-written share text: 'I'm working on something important for my wellbeing. I've given you a private link: [link]. Thank you.'

GuardianStatusCard (when link exists):
- Guardian alias + relationship + monitoring level
- 'Revoke Access' red button (confirmation modal)

API: `POST /api/guardian/create` — generate 32-char token, return URL
API: `POST /api/guardian/revoke`

---

## PART 4 — TEAM B PROMPTS (Admin & Platform)

Team B sends prompts B1 through B6 in sequence. Coordinate env vars with Team A.

### TEAM B — PROMPT B1: All API Routes & Supabase Setup

Build all server-side API routes for SafeGround. These are shared by Team A's UI.

SUPABASE CONFIG:
- Region: af-south-1 (closest to Ethiopia)
- Run the full DDL schema (provided in spec Section 3) in Supabase SQL Editor
- Enable Realtime for: `anonymous_chat` table
- Enable Auth providers: Email + Phone OTP

MIDDLEWARE — `middleware.ts`:
- Protected routes: `/dashboard/*`, `/admin/*`
- Public routes: `/`, `/guest`, `/register`, `/login`, `/guardian/*`, `/onboarding`
- Admin check: auth user email in `ADMIN_EMAILS` env var
- onboarding_done check: if profile.onboarding_done=false → redirect /onboarding

API ROUTES — implement ALL of these:

**`POST /api/auth/profile`**
- Create profile after registration
- Body: `{ alias, language_pref, support_preference, trigger_tags[], streak_goal }`
- INSERT into profiles, INSERT into streaks (all zeros)

**`POST /api/habits/log`**
- Insert daily habit_log row
- Body: `{ mood_score, stress_level, urge_intensity, relapsed, khat_used_today, khat_hours_ago, alcohol_used_today, trigger_tags[], log_date }`
- Trigger streak update via DB trigger (already in schema)
- Return: `{ log_id, streak_updated: true }`

**`GET /api/habits/streak`**
- Return: `{ current_streak, longest_streak, total_clean_days, last_clean_date }`

**`GET /api/habits/history?days=30`**
- Return last N days of habit_logs for chart data

**`POST /api/ai/affirmation`**
- Body: `{ mood_score, urge_intensity }`
- Call `claude-sonnet-4-20250514`, max_tokens: 150
- Fallback: return random from 20 hardcoded affirmations if API fails
- Return: `{ affirmation: string }`

**`POST /api/panic`**
- Body: `{ intensity, context_tags[] }`
- INSERT habit_log (ai_intervention_triggered=true)
- Call Claude for coping steps (JSON mode)
- Async: check guardian_controls, log notification
- Return: `{ session_id, steps[], affirmation }`

**`POST /api/panic/complete`**
- Body: `{ session_id, completed_steps }`
- Mark streak as protected, INSERT milestone if 3/7/14/30/60/90 day

**`POST /api/chat/flag`**
- Body: `{ message_id }`
- UPDATE `anonymous_chat` SET is_flagged=true WHERE id=?

**`GET /api/directory?type=&city=&language=&online=&pro_bono=`**
- SELECT from providers WHERE is_verified=true AND is_active=true
- Apply filters. Return paginated list.

**`POST /api/bookings`**
- Insert telehealth_booking. Return confirmation.

**`POST /api/faith/companion`**
- Body: `{ messages[], user_context: { religion, language_pref } }`
- Claude system prompt (multi-faith, non-dogmatic, Ethiopian context)
- max_tokens: 200. Return: `{ response: string }`

**`POST /api/guardian/create`**
- Generate 32-char `crypto.randomBytes` token
- INSERT guardian_controls. Return: `{ token, access_url }`

**`GET /api/guardian/view/[token]`**
- Validate token, return sanitized data:
  - `{ current_streak, longest_streak, last_7_days_mood[], last_panic_event_date, recent_alerts[] }`
  - NO relapse data, NO trigger tags, NO substance flags
  - UPDATE `last_accessed_at`

**`POST /api/guardian/revoke`**
- SET `is_active=false` on guardian_controls

**`POST /api/guest/chat`**
- No auth required. Claude AI chat for guest mode.
- Rate-limit: 20 messages per session (track in Redis or in-memory)

### TEAM B — PROMPT B2: Admin System Overview Dashboard

Build the Admin Platform Dashboard.

DESIGN REFERENCE: admin_platform_dashboard screen

**ROUTE:** `app/admin/page.tsx` (Server Component, admin-only)

ADMIN SIDEBAR (`app/admin/layout.tsx`):
- Logo: 'SafeGround' in amber + search bar at top
- Nav items (with icons, match admin screen):
  - Dashboard (active: green highlight, grid icon)
  - Recovery (cross icon)
  - Community (people icon)
  - Telehealth (calendar icon)
  - Moderation (shield icon)
  - Appointments (calendar icon)
  - Programs (chart icon)
  - Settings (gear icon)
- Bottom: PANIC red full-width pill | Support | Logout

HEADER:
- 'System Overview' in amber-800 (large)
- 'Admin Portal & Enterprise Monitoring' subtitle
- 'LIVE STATUS: OPTIMAL' green badge (top right)

METRIC CARDS ROW 1 (match exact design):
- Total Users: '12,482' + '+12% ↑' green trend
- Today's Panic Events: '42' in red + 'Real-time' badge (red border card)
- Active Streaks: '894' + 'Avg 14d' amber text
- Provider Queue: '18' + 'Pending' blue text (blue border card)

REGIONAL ACTIVITY HEATMAP:
- Ethiopian map visualization — use a placeholder SVG of Ethiopia
- Bubble overlays for Addis Abeba (large), Hawassa, Dire Dawa (medium)
- Legend: 'Low ○' | 'High ●'

MODERATION QUEUE (right panel):
- Each flagged message shows:
  - 'AGGRESSIVE LANGUAGE' red badge + '2m ago'
  - Message text (truncated in quotes)
  - 'DELETE' red button | 'IGNORE' outline button
- 'View All Flagged (142)' amber link

30-DAY ACTIVITY TRENDS CHART:
- Recharts BarChart — CHECK-INS (amber) and PANIC (red) dual series
- X-axis: DAY 1, DAY 10, DAY 20, TODAY

PENDING PROVIDER VERIFICATIONS table:
- Columns: ENTITY | TYPE | ACTION
- Each row: Avatar initials + name + org | type badge | 'VERIFY' amber button
- Type badges: MEDICAL (blue) | SPIRITUAL (amber) | COMMUNITY (green)

**API: `GET /api/admin/metrics`**
- Returns: `{ total_users, panic_today, active_streaks, provider_queue, avg_streak, relapse_rate_7d, chat_today, flagged_messages, activity_30d: [{date, checkins, panic}] }`
- Server-side only, uses service role key

### TEAM B — PROMPT B3: Provider Management & Organization Flows

Build the Provider Approval system and Organization portal flows.

**PAGE 1 — `app/admin/providers/page.tsx`**
DESIGN REFERENCE: organization_approval_center screen
- List of providers WHERE `is_verified=false`
- `ProviderReviewCard.tsx` for each:
  - Avatar initials circle (amber bg) + name + org + city
  - Provider type badge
  - Bio (full, not truncated in review)
  - Languages spoken
  - Consultation fee
  - Availability (online/in-person/hybrid)
  - Documents uploaded (list with green check)
- Actions:
  - '✅ Verify' — PATCH `/api/admin/providers/[id]/verify` `{verified: true}`
  - '❌ Reject' — PATCH `/api/admin/providers/[id]/verify` `{verified: false}`
- Optimistic UI: card fades out on action, toast notification

**PAGE 2 — `app/admin/moderation/page.tsx`**
- `FlaggedMessageCard.tsx` for each `is_flagged` message:
  - sender_alias, room_id, sent_at, message text
  - Flag reason badge (AGGRESSIVE | SPAM | INAPPROPRIATE)
  - '🗑 Delete' — soft delete (`is_deleted=true`)
  - '✓ Clear Flag' — set `is_flagged=false`
  - Batch select checkbox + 'Bulk Delete Selected' button

**PAGE 3 — Organization Registration (org-facing, not admin)**
DESIGN REFERENCE: organization_registration_page screen
Route: `app/org/register/page.tsx` (public, no auth required for submission)
- Multi-section form:
  - Section 1: Organization Information
    - Organization name, type (NGO | Religious Org | Healthcare | University)
    - Registration number, country, city
  - Section 2: Contact & Leadership
    - Primary contact name, email, phone, role/title
  - Section 3: Service Details
    - Services offered (checkboxes), languages, online/in-person
    - Fee structure, pro-bono availability
  - Section 4: Verification Documents
