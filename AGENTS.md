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
- 💬 Posted in Global Support · 3d ago
- 🙏 Encouragement received from Guardian · 4d ago

### 24.7 Achievement Center (8-col + 4-col split)

**Left — Recovery Level System** (8 cols):
- Level 1 → Level 12 ladder
- XP bar with total points
- "Earn 240 XP to reach Level 5: Healer"
- Unlocked perks list

**Right — Badge Wall** (4 cols, grid 2×3):
- 🛡️ 3-Day Shield, 🌅 7-Day Dawn, 🦅 14-Day Eagle, 🏔️ 30-Day Mountain, 🌍 60-Day World, 🌌 90-Day Cosmos
- Locked badges in muted grey
- Hover → unlock criteria tooltip

### 24.8 Quick Actions Grid (full width, 6 columns)

| Action | Icon | Description | Accent |
|---|---|---|---|
| Daily Check-In | 📝 | Log mood, stress, urge | amber |
| Panic Support | 🚨 | Emergency intervention | red |
| Community Chat | 💬 | Anonymous support rooms | green |
| Find Counselor | 👨‍⚕️ | Book professional | blue |
| Faith Support | 🕊️ | Spiritual programs | amber |
| Guardian Support | 🛡️ | Trusted supporter | green |

Each tile: `rounded-xl border border-[#e5e0db] p-4 hover:shadow-md hover:border-[#92400E] transition` with icon, title, 1-line description, chevron arrow.

### 24.9 User Dashboard File Plan

| File | Purpose |
|---|---|
| `app/(dashboard)/dashboard/page.tsx` | Server component: fetch streak, score, history, insights |
| `app/(dashboard)/dashboard/_components/HeroCard.tsx` | Hero with ring + score |
| `app/(dashboard)/dashboard/_components/KpiRow.tsx` | 6 KPI cards |
| `app/(dashboard)/dashboard/_components/InsightFeed.tsx` | AI insights list |
| `app/(dashboard)/dashboard/_components/RiskCard.tsx` | Risk score + factors |
| `app/(dashboard)/dashboard/_components/ChartsRow.tsx` | 3 Recharts charts |
| `app/(dashboard)/dashboard/_components/ActivityTimeline.tsx` | Reverse-chronological feed |
| `app/(dashboard)/dashboard/_components/AchievementCenter.tsx` | Level + badges |
| `app/(dashboard)/dashboard/_components/QuickActions.tsx` | 6 action tiles |
| `app/api/insights/route.ts` | Returns AI-generated insights based on logs |

---

## 25. ADMIN DASHBOARD — "Executive Operations Center"

Route: `/admin`
Auth: required + admin email
Layout: full DashboardShell, all admin-only routes.

### 25.1 Executive KPI Row (4 large cards)

| Card | Value | Sub | Trend | Accent |
|---|---|---|---|---|
| Daily Active Users | 1,247 | ▲ 12% vs yesterday | sparkline 7d | amber |
| Weekly Active Users | 4,892 | ▲ 8% WoW | sparkline 8w | amber |
| Monthly Active Users | 18,341 | ▲ 24% MoM | sparkline 12m | amber |
| Total Registered | 26,108 | +248 this week | sparkline 30d | blue |

Below the row: **Retention Rate 67%** (amber), **Success Rate 41%** (green), **Panic Activations 89** (red), **Bookings 312** (blue), **Faith Enrollments 78** (purple), **Guardian Connections 156** (green) — 6 mini-KPIs in a 6-col grid.

### 25.2 Real-Time Monitoring Panel (split view)

**Left (6 cols) — Live Activity Feed**:
- Header: "Live Activity" + green pulse dot + "Realtime" badge
- Items stream in via Supabase Realtime:
  - 👤 New signup · QuietLion42 · 2s ago
  - ✅ Check-in · Mood 8/10 · 5s ago
  - 🚨 Panic event · Streak protected · 12s ago
  - 📅 Booking confirmed · Dr. Hiwot · 18s ago
  - 🙏 Enrollment · Restoration Fellowship · 25s ago
- Each row: icon, action, context, time-ago
- "View all activity" link → `/admin/activity`

**Right (6 cols) — Geographic Heatmap**:
- Stylized Ethiopia SVG (preserved from current implementation)
- Bubble size = active users
- Hover → tooltip (City, Active Users, Avg Streak)
- Top 3 city cards: Addis Ababa 547 • Hawassa 218 • Dire Dawa 134

### 25.3 Analytics Center (3 charts row)

| Chart | Type | Window | Accent |
|---|---|---|---|
| User Growth | Recharts AreaChart, stacked by role | 30d | amber-500 |
| Recovery Success Rate | Recharts LineChart, smooth | 90d | green-500 |
| Engagement | Recharts BarChart, daily active | 30d | blue-500 |
| Retention Cohorts | Recharts Heatmap | 12w | purple-500 |
| Program Performance | Recharts RadarChart, 5 programs | now | amber-700 |
| Panic Trend | Recharts ComposedChart (line+bar) | 30d | red-500 |

Tabs above: 7d / 30d / 90d / 1y / All time

### 25.4 Provider Management Section

3-column layout: **Approval Queue** (5 cols), **Verification Workflow** (4 cols), **Performance Monitoring** (3 cols).

- Approval Queue: list of pending providers with quick Verify/Reject actions
- Verification Workflow: pipeline view (Submitted → Docs Review → Background → Approved) with counts at each stage
- Performance Monitoring: top 5 providers by rating, sessions, response time

### 25.5 Moderation Center

- Flagged messages list with bulk select + bulk action toolbar (Delete, Dismiss, Escalate, Ban user)
- Filters: AGGRESSIVE / SPAM / INAPPROPRIATE / OFF-TOPIC
- Each message: flag badge, alias, time-ago, truncated text, full message on click (drawer)
- "Bulk delete" with confirmation modal

### 25.6 Audit Center (admin-only)

- System logs: timestamp, actor, action, target, IP
- Admin actions: who approved/rejected/deleted what
- Security events: failed logins, suspicious patterns
- Change history: diff view for sensitive tables
- Export → CSV / JSON

### 25.7 Admin Dashboard File Plan

| File | Purpose |
|---|---|
| `app/admin/page.tsx` | Server component: aggregate metrics + pass to client |
| `app/admin/_components/ExecutiveKpiRow.tsx` | 4 hero KPI cards |
| `app/admin/_components/LiveActivityFeed.tsx` | Real-time Supabase subscription |
| `app/admin/_components/GeoHeatmap.tsx` | SVG map + bubbles |
| `app/admin/_components/AnalyticsCenter.tsx` | 6 Recharts |
| `app/admin/_components/ProviderManagement.tsx` | Queue + workflow + perf |
| `app/admin/_components/ModerationCenter.tsx` | Flagged messages + bulk actions |
| `app/admin/_components/AuditCenter.tsx` | Logs + history + export |
| `app/api/admin/audit/route.ts` | Returns audit events |

---

## 26. PROVIDER DASHBOARD — "Professional Healthcare Portal"

Route: `/provider/dashboard`
Auth: required + provider role

### 26.1 Provider Overview (4 KPI cards)

| Card | Value | Sub | Accent |
|---|---|---|---|
| Today's Appointments | 5 | 2 confirmed, 3 pending | blue |
| This Week | 23 | ▲ 4 vs last week | blue |
| Total Sessions | 412 | Lifetime | amber |
| Rating | 4.8 / 5 | 89 reviews | green |

### 26.2 Schedule Center (calendar)

- Tabs: **Day / Week / Month** view
- Week view: 7-col grid × hourly rows (8:00–18:00)
- Each booking: anonymous alias, session type badge (Initial blue / Follow-up purple / Crisis red), duration pill, status (Confirmed/Pending/Completed)
- **Join Session** green button (10 min before start)
- Color-coded availability (green = available, amber = busy, red = blocked)
- Drag-and-drop reschedule (optional enhancement)
- "New appointment" FAB

### 26.3 Patient Management (3 panels)

**Left — Patient List** (4 cols):
- Anonymized aliases only (QuietLion42, HopeRunner, etc.)
- Last session date, total sessions, current streak
- Search + filter (active / inactive / new)

**Center — Patient Detail** (5 cols):
- Session history (timeline)
- Encrypted notes
- Treatment plan (free-text)
- Next appointment
- "Add note" button → opens encrypted note modal

**Right — Follow-up Reminders** (3 cols):
- Patients due for follow-up in 7 days
- One-click "Send reminder" button (in-app notification)
- Snooze / dismiss actions

### 26.4 Provider Analytics

| Chart | Type | Window | Accent |
|---|---|---|---|
| Session Completion Rate | Recharts RadialBar | 30d | green |
| Attendance Rate | Recharts LineChart | 12w | blue |
| Patient Satisfaction | Recharts BarChart (1–5 stars) | 30d | amber |
| Weekly Trends | Recharts AreaChart | 12w | amber-500 |
| Monthly Performance | Recharts ComposedChart | 12m | amber-700 |

### 26.5 Availability & Settings

- Weekly calendar grid (Mon–Sat × 8:00–18:00, clickable green slots) — **preserved**
- Session types checkboxes (Initial / Follow-up / Crisis) — **preserved**
- Online / In-person toggles with Hybrid indicator — **preserved**
- New: time-off blocks, recurring availability templates, sync with Google Calendar (future)

### 26.6 Communication Center

- Appointment notifications (auto + manual)
- Patient messages (provider inbox)
- Bulk announcements to all patients
- Reminder system (24h, 1h before session)

### 26.7 Provider File Plan

| File | Purpose |
|---|---|
| `app/provider/dashboard/page.tsx` | Server component: provider data |
| `app/provider/dashboard/_components/ProviderOverview.tsx` | 4 KPI cards |
| `app/provider/dashboard/_components/ScheduleCenter.tsx` | Day/Week/Month calendar |
| `app/provider/dashboard/_components/PatientManagement.tsx` | List + Detail + Reminders |
| `app/provider/dashboard/_components/ProviderAnalytics.tsx` | 5 Recharts |
| `app/provider/dashboard/_components/AvailabilitySettings.tsx` | Grid + toggles (preserved) |
| `app/provider/dashboard/_components/CommunicationCenter.tsx` | Notifications + messages |

---

## 27. GUARDIAN DASHBOARD — "Recovery Support Portal"

Route: `/guardian/[token]`
Auth: **none** (token-gated, public route)

### 27.1 Privacy Rules (CRITICAL)

Guardian **NEVER** sees:
- ❌ Private journal entries
- ❌ Chat messages
- ❌ Private notes
- ❌ Detailed triggers (only "high-risk window today" yes/no)
- ❌ Relapse detail (only "last relapse: 12 days ago" — no cause/notes)
- ❌ AI reflections

Guardian **MAY** see (sanitized):
- ✅ Current streak (number only)
- ✅ Goal progress (X/Y days)
- ✅ Recovery status badge (Improving / Steady / Needs Support)
- ✅ Mood trend (weekly aggregate, anonymized points)
- ✅ Panic activity count (no details)
- ✅ Milestone list (which badges unlocked, when)

### 27.2 Guardian Overview (4 KPI cards)

| Card | Value | Sub | Accent |
|---|---|---|---|
| Current Streak | 14 days | ▲ 2 from last week | amber |
| Goal Progress | 47% | 16 days remaining | amber |
| Recovery Status | Improving | Steady trend | green |
| Last Panic Event | 2 days ago | Streak protected | blue |

### 27.3 Recovery Analytics (sanitized)

- **Mood Trend** — Recharts LineChart, weekly aggregate, no daily points
- **Goal Completion** — Recharts RadialBar with X/Y
- **Streak Timeline** — Recharts AreaChart, weekly clean days
- **Risk Signal (Boolean)** — green = "Stable", amber = "Elevated today", red = "High risk — consider reaching out"
  - **Never** shows the cause or detail

### 27.4 Support Actions (3 cards)

| Action | Description | API |
|---|---|---|
| 💌 Send Encouragement | One-tap motivational message | `POST /api/guardian/encourage` |
| 🧘 Suggest Calm Activity | Sends a breathing/grounding tip | `POST /api/guardian/encourage` (variant) |
| 🙏 Share Faith Quote | Sends daily scripture or quote | `POST /api/guardian/encourage` (variant) |

Each card: emoji, title, description, "Send" button → toast confirmation "Sent to {alias}".

### 27.5 Weekly Summary (auto-generated every Sunday)

- This week: 5 check-ins, 2 peaks in stress, 1 milestone (7-day)
- Mood: average 7.2 / 10
- Trend: improving
- "Send weekly summary" toggle (default on)

### 27.6 Alert Settings (guardian-side preferences)

- 🔔 Panic Alerts (instant)
- 📊 Weekly Summaries (Sunday 6 PM)
- ⚠️ Relapse Notifications (sanitized count only)
- 🏅 Milestone Celebrations (badge unlocks)

### 27.7 Access Controls

- Guardian Access Active ✓
- Last viewed: 2h ago
- "Revoke Access" button → confirmation modal → calls `POST /api/guardian/revoke`
- New: "View audit log of my access" (when did I last view this dashboard?)

### 27.8 Guardian File Plan

| File | Purpose |
|---|---|
| `app/guardian/[token]/page.tsx` | Server: fetch sanitized data via `/api/guardian/view/[token]` |
| `app/guardian/[token]/_components/GuardianOverview.tsx` | 4 KPI cards |
| `app/guardian/[token]/_components/SanitizedCharts.tsx` | Mood/Goal/Streak charts |
| `app/guardian/[token]/_components/SupportActions.tsx` | 3 encouragement cards |
| `app/guardian/[token]/_components/WeeklySummary.tsx` | Auto-generated weekly digest |
| `app/guardian/[token]/_components/AlertSettings.tsx` | Toggle preferences |
| `app/guardian/[token]/_components/AccessControls.tsx` | Revoke + audit log |

---

## 28. ORGANIZATION DASHBOARD — "Program Management Platform"

Route: `/org/portal`
Auth: required + matching org-type provider

### 28.1 Org Overview (4 KPI cards)

| Card | Value | Sub | Accent |
|---|---|---|---|
| Participants | 248 | ▲ 18 this month | amber |
| Active Programs | 12 | 3 launching next week | blue |
| Sessions (30d) | 412 | ▲ 12% MoM | green |
| Engagement Rate | 73% | Strong participation | green |

### 28.2 Program Management

**Tabs**: All / Active / Draft / Completed

Each program card:
- Cover image, title, type (Faith / NGO / University)
- Participant count, completion rate, current week
- "Manage" → opens Program Detail
- "Create new program" button → opens wizard

**Create Program Wizard** (3 steps):
1. Basic info: name, type, description, cover image
2. Curriculum: weekly topics, materials, assignments
3. Enrollment: open / invite-only, capacity, start date

### 28.3 Participant Management

- Table: Alias, Program, Week, Attendance %, Last Active, Status
- Search + filter
- Anonymized names (QuietLion42, etc.)
- "Send announcement" → bulk message
- "Export participants" → CSV

### 28.4 Org Analytics

| Chart | Type | Window | Accent |
|---|---|---|---|
| Program Success Rate | Recharts BarChart (per program) | 90d | green |
| Attendance Rate | Recharts LineChart | 12w | blue |
| User Engagement | Recharts AreaChart | 30d | amber-500 |
| Growth Trends | Recharts ComposedChart | 12m | amber-700 |
| Completion Funnel | Recharts FunnelChart | 90d | purple |
| Satisfaction | Recharts RadialBar | 30d | amber |

### 28.5 Reports & Export

- **Export PDF**: branded PDF with logo, KPIs, charts (jsPDF + html2canvas)
- **Export Excel**: full data tables (xlsx)
- **Export Analytics**: JSON for BI tools
- **Scheduled reports**: weekly / monthly email

### 28.6 Org Appointments

- List of upcoming telehealth bookings (anonymized aliases)
- Confirm / Reschedule / Cancel actions
- "Join session" button for confirmed bookings

### 28.7 Platform Health (preserved from current)

- Completion Rate bar
- Attendance bar
- Satisfaction bar
- Each: `bg-[#f6f5f1]` track, `bg-[#92400E]` fill, animated

### 28.8 Org File Plan

| File | Purpose |
|---|---|
| `app/org/portal/page.tsx` | Server: fetch org data via `/api/org/portal` |
| `app/org/portal/_components/OrgOverview.tsx` | 4 KPI cards |
| `app/org/portal/_components/ProgramManagement.tsx` | List + Create wizard |
| `
