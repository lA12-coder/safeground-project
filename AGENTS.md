# SafeGround — Project Documentation

## Overview

SafeGround is a privacy-first anonymous recovery and digital well-being platform for Ethiopian youth. It addresses compulsive pornography use, digital well-being challenges, khat-related impulse spikes, and broader recovery needs through AI-powered tools, community support, professional telehealth, faith-based programs, and guardian accountability.

This document covers architecture decisions, API routes, dashboards, seed data, design system, and all user flows.

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
  dashboard/                    # StreakCard, MoodChart, AffirmationCard, RiskBanner, etc.
  layout/                       # Sidebar, BottomNav, PanicButton
  guardian/                     # GuardianDashboard, GuardianSetupWizard

lib/
  ai/gemini.ts                  # callGemini(), callGeminiJSON<T>() — Google Gemini SDK wrapper
  supabase/                     # client.ts (browser), server.ts (RSC), middleware.ts (edge)
  types/index.ts                # All TypeScript types
  utils/                        # aliasGenerator, streakUtils, riskDetector

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
| `/api/ai/affirmation` | POST | Gemini-generated affirmation with 20 hardcoded fallbacks |
| `/api/ai/chat` | POST | Multi-purpose AI chat companion |
| `/api/faith/companion` | POST | Multi-faith spiritual companion (Ethiopian context) |

### Panic
| Route | Method | Description |
|---|---|---|
| `/api/panic` | POST | Insert panic habit_log, Gemini coping steps, guardian notification |
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
| `/api/guest/chat` | POST | Gemini chat, rate-limited to 20 msg/session (in-memory) |

### Admin
| Route | Method | Description |
|---|---|---|
| `/api/admin/metrics` | GET | All admin dashboard metrics |
| `/api/admin/seed?type=` | POST | Seed data (users/logs/providers/chat/guardians/bookings/demo/clear) |
| `/api/admin/providers/[id]/verify` | PATCH | Verify or reject a provider |
| `/api/admin/providers/[id]/grant-access` | POST | Create auth user + link to provider |
| `/api/admin/chat/[id]/delete` | DELETE | Soft-delete flagged chat message |

### Provider
| Route | Method | Description |
|---|---|---|
| `/api/provider/bookings` | GET | Provider-scoped bookings (joins profiles for alias) |
| `/api/provider/bookings/[id]` | PATCH | Confirm/reschedule/cancel booking |
| `/api/provider/notes` | POST | Save encrypted session notes |
| `/api/provider/availability` | GET/PATCH | Fetch/update online/in_person/session_types/availability_slots |

### Org
| Route | Method | Description |
|---|---|---|
| `/api/org/portal` | GET | Org portal metrics + appointments |

---

## Admin Dashboard (`/admin`)

### Sidebar
- Logo in `text-amber-700` + search bar
- Nav: Dashboard (grid), Recovery (cross), Community (people), Telehealth (calendar), Moderation (shield), Appointments (calendar), Programs (chart), Settings (gear)
- Active state: green `bg-secondary-container text-on-secondary-container`
- Bottom: PANIC red pill | Support | Logout

### Dashboard Page (Server Component)
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
| Learning | Recovery guide + Support Group + quote panel |
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
| Habit Logs | ~1560 | 60 days × 26 users, realistic mood sine waves |
| Providers | 9 | 8 verified + 1 pending |
| Chat Messages | 50 | Mix of text/milestone_shares, 1 flagged as aggressive |
| Guardians | 3 | 2 seed + 1 for demo with known token |
| Bookings | 5 | 4 seed + 1 demo (Dr. Hiwot, tomorrow 10AM) |
| Faith Program | 1 | Demo enrolled in Restoration Fellowship Week 4 |

**Demo Account** (`Biruk-Eagle-28`):
- 28-day current streak
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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
ADMIN_SECRET_KEY=your_admin_secret_key_here
ADMIN_EMAILS=admin@example.com,superadmin@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Build & Run

```bash
npm install
cp .env.local.example .env.local
npm run dev                         # http://localhost:3000

pnpm install
pnpm dev

npx tsc --noEmit                   # Type check
npx tsx scripts/seed.ts            # Seed demo data
npm run build                      # Production build
npm start                          # Start production
```

---

## Design System

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

### Dark Mode
```css
.dark {
  --bg-canvas: #14110f;
  --bg-surface: #1c1815;
  --bg-subtle: #221d19;
  --border: #2c241f;
  --text-primary: #f5efe8;
  --text-muted: #b8a99a;
  --accent: #f59e0b;
}
```

### Key Files
- `/app/provider/dashboard/page.tsx`: Today schedule, upcoming, session notes, availability grid, booking trends chart
- `/app/org/portal/page.tsx`: Participant metrics, platform health bars, appointments list, program progress
- `/app/guest/page.tsx` → `GuestSanctuary`: Chat panel, right panel, panic FAB
- `/app/globals.css`: Custom scrollbar, dashboard utility classes

---

## Auth & Access Control

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
- Provider API routes used `providers.id = user.id`
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

---

## Design System v3 — Unified Dashboard Shell (June 2026)

A unified design system powers every dashboard (User, Admin, Provider, Guardian, Organization).

### Shared Shell

| Region | Component | Behavior |
|---|---|---|
| Left rail | Collapsible **Sidebar** | 64px collapsed / 256px expanded. Icon + label. Active route: amber `#92400E` left border + light-amber background. |
| Top bar | **DashboardTopBar** | Sticky, 56px tall, white bg, `border-b border-[#e5e0db]`, shadow-sm on scroll. |
| Top bar (left) | Page title + breadcrumb | e.g. "Recovery Intelligence Center › Overview" |
| Top bar (center) | **GlobalSearch** (⌘K) | Command palette searching users, providers, bookings, messages, programs. |
| Top bar (right) | **NotificationCenter** (bell + unread dot) | Dropdown: in-app notifications grouped by Today / This Week. |
| Top bar (right) | **LanguageToggle** (Amharic / English) | Persists in `profiles.language`. |
| Top bar (right) | **DarkModeToggle** (sun/moon) | `localStorage`, toggles `.dark` class on `<html>`. |
| Top bar (right) | **UserMenu** (avatar + dropdown) | Profile, Settings, Help, Logout. |
| Bottom (mobile) | **BottomNav** | 5 icons: Home / Dashboard / Panic / Chat / Profile. |
| Floating (everywhere) | **PanicButton** | Red pill, fixed bottom-right, z-50, opens `/panic` modal. |

### Role-Based Sidebar Items

- **User sidebar**: Dashboard, Daily Check-In, Panic, Chat, Professional, Faith, Guardian, Profile, Settings, Logout
- **Admin sidebar**: Dashboard, Recovery, Community, Telehealth, Moderation, Appointments, Programs, Analytics, Settings, Logout
- **Provider sidebar**: Dashboard, Schedule, Patients, Notes, Availability, Profile, Settings, Logout
- **Org sidebar**: Dashboard, Programs, Participants, Appointments, Reports, Profile, Settings, Logout
- **Guardian sidebar**: Overview, Trends, Encouragement, Resources, Settings, Logout

### Role-Based Permissions

```
canSee('user-mgmt')      → admin only
canSee('audit-logs')     → admin only
canSee('session-notes')  → provider (own) + admin
canSee('guardian-data')  → guardian (own token) + user
canSee('org-metrics')    → org admin + super admin
canSee('private-journal')→ user only — NEVER exposed via API
```

### Real-Time & Notifications

- Supabase Realtime subscriptions on: `habit_logs`, `panic_events`, `chat_messages`, `bookings`, `guardian_notifications`
- Reconnecting WebSocket indicator in top bar
- In-app notification center groups: Today, This Week, Earlier
- Bell badge shows unread count (red dot)

---

## User Dashboard — "Recovery Intelligence Center"

Route: `/dashboard`
Auth: required + `onboarding_done`
Layout: 12-col grid, max-w-7xl, with collapsible left sidebar.

### Top Header Bar
- Greeting: "Good morning, QuietLion42" (changes by time of day)
- Breadcrumb: Dashboard › Overview
- Quick KPI strip: 14d streak • Goal 30d (47%) • Recovery 78/100

### Hero Recovery Card
- Animated streak number with progress ring
- Recovery Score 0–100 with delta vs. last week
- Current goal tracking and next milestone

### KPI Row
| Card | Value | Accent |
|---|---|---|
| Current Streak | 14 days (+2 vs last week) | amber |
| Longest Streak | 32 days (Personal best) | amber |
| Recovery Score | 78 / 100 (▲ 6 this week) | amber |
| Goal Completion | 47% (16 days remaining) | blue |
| Total Clean Days | 187 days (Lifetime) | green |
| Weekly Progress | 6/7 check-ins (Strong week) | green |

### AI Recovery Insights
- Chronological insight feed with contextual tips
- Risk Prediction Card (score 0–100 with color band, top risk factors, suggested actions)

### Advanced Analytics
- Mood Trend (AreaChart, 30d)
- Stress Trend (LineChart, smooth, 30d)
- Urge Intensity (BarChart, 30d)
- Recovery Score (RadialBar, 30d)
- Relapse Timeline (ScatterChart on calendar, 90d)
- Trigger Frequency (HorizontalBar, 30d)

### Activity Timeline
Reverse-chronological feed: check-ins, panic sessions, milestones.

---

## Localization

- Languages: Amharic (`am`), English (`en`), Afaan Oromo (`om`), Tigrinya (`ti`)
- Language switcher in onboarding and top bar
- Amharic text uses Noto Serif Ethiopic font
- Guarded translations: all UI text wrapped in `t(key, amharicFallback)`

---

## Security & Privacy

- **Anonymous aliases**: No PII in UI. Aliases generated as `Adjective-Animal-Number`
- **Zero-log architecture**: No device fingerprinting, no tracking scripts
- **Local journal encryption**: User journal stays on device, never uploaded
- **Guardian tokens**: 32-byte cryptographically secure random tokens
- **Soft deletes**: Moderation preserves data integrity
- **Rate limiting**: Guest chat limited to 20 messages per session (in-memory)
- **RLS policies**: Row-level security on all Supabase tables

---

*SafeGround © 2026 — Privacy First · No Tracking · No Public Profiles*
