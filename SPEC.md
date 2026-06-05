# SafeGround — Complete MVP Technical Specification

> **Anonymous Recovery & Digital Well-Being Platform for Ethiopian Youth**
>
> **Stack:** Next.js 16 · Supabase · Google Gemini AI · Tailwind CSS v4
> **Deploy:** Vercel (single command)

---

## Overview

SafeGround is a privacy-first recovery support platform designed for Ethiopian university students. It provides anonymous tools for habit tracking, crisis intervention, peer support, professional telehealth, faith-based programs, and guardian accountability — all within a single unified platform.

### Core Principles

- **Anonymous by Design** — No real names, no public profiles, no device fingerprinting
- **Privacy First** — Zero-log architecture, local encryption, private keys
- **Culturally Grounded** — Multi-language support (Amharic, English, Oromifa, Tigrinya), Ethiopian context
- **Evidence-Based** — AI-powered coping strategies, CBT urge-surfing, streak-based motivation
- **Multi-Stakeholder** — Students, guardians, providers, organizations, and admins each have tailored experiences

---

## Target Problems

Many young Ethiopian university students struggle silently with:

| Problem Area | Description |
|---|---|
| Compulsive pornography use | Silent struggle affecting academic and personal life |
| Digital well-being challenges | Phone dependency, late-night usage, social media overuse |
| Khat-related impulse spikes | Substance use triggering relapse patterns |
| Shame cycles | Social stigma preventing help-seeking |
| Anxiety and stress | Academic pressure compounded by addictive behaviors |
| Isolation | Lack of safe spaces for honest conversation |

SafeGround breaks the cycle through **anonymous, judgment-free, evidence-based support**.

---

## Platform Stakeholders

| Role | Access | Capabilities |
|---|---|---|
| **Student** | Auth + onboarding | Anonymous tracking, AI companion, crisis support, chat, directory, faith programs |
| **Guardian** | Token-gated (no auth) | Read-only streak/mood view, encouragement tools, panic notifications |
| **Provider** | Auth + provider record | Booking management, encrypted session notes, availability calendar |
| **Organization** | Auth + org record | Wellness portal, participant metrics, program management |
| **Admin** | Auth + admin email | Real-time metrics, moderation, provider verification, seed data management |

---

## User Flows

### Complete User Journey

```
Landing Page
    ↓
Anonymous Registration
    ↓
Onboarding (5 steps: Language → Triggers → Preference → Guardian → Goal)
    ↓
Main Dashboard
    ↓
Daily Check-In (mood, stress, urge, substance use, triggers, journal)
    ↓
AI Analysis & Insights
    ↓
Dashboard Update (streak, charts, milestones)
    ↓
If High Risk → Panic Button → AI Coping Tasks → Completion Reward → Dashboard
    ↓
Optional Support Path:
    ├── Anonymous Chat (peer support rooms)
    ├── Professional Counselor (telehealth directory + booking)
    ├── Faith Program (multi-faith recovery programs)
    └── Guardian Support (token-gated read-only access)
    ↓
Weekly Insights → Milestone Achievements → Long-Term Recovery Progress
```

### Hackathon Demo Flow (4–6 minute presentation)

```
Landing Page → Anonymous Signup → Onboarding → Dashboard → Daily Check-In
→ AI Insight → Panic Button → Coping Session → Chat Room → Telehealth Directory
→ Faith Program → Guardian Dashboard → Admin Dashboard → Success Story & Metrics
```

---

## Page Directory & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Landing | Public | Marketing page with features, testimonials, CTAs |
| `/guest` | Anonymous Sanctuary | Public | AI chat + mood selector + breathing exercises (no account) |
| `/register` | Join Anonymously | Public | Language selection + alias generation |
| `/login` | Login | Public | Email-based authentication |
| `/onboarding` | Guided Onboarding | Auth | 5-step wizard (language, triggers, preference, guardian, goal) |
| `/dashboard` | Recovery Intelligence Center | Auth+Done | Streak, mood charts, AI insights, KPI cards, risk prediction |
| `/log` | Daily Check-In | Auth+Done | Mood emoji, stress slider, urge intensity, substance flags, journal |
| `/chat` | Community Healing Spaces | Auth+Done | Anonymous chat rooms with real-time messages and reactions |
| `/panic` | Emergency Support | Always | Breathing circle → urge surfing → completion celebration |
| `/directory` | Support Directory | Auth+Done | Filterable provider cards + booking flow |
| `/spiritual` | Spiritual Support Hub | Auth+Done | Faith programs, wisdom companion AI, scripture/reflection |
| `/settings/guardian` | Guardian Link Setup | Auth+Done | Generate/revoke guardian token, set permissions |
| `/guardian/[token]` | Guardian View | Public (token) | Read-only streak, mood trends, encouragement cards |
| `/admin` | System Overview | Admin | Metrics, chart, moderation queue, provider table, regional map |
| `/admin/providers` | Provider Approval | Admin | Review, verify, reject providers |
| `/admin/moderation` | Chat Moderation | Admin | Flagged messages, bulk delete, clear flags |
| `/admin/seed` | Demo Data | Admin | 7 seed types + reset + clear all |
| `/org/register` | Org Registration | Public | 4-step org signup with document upload |
| `/org/portal` | Wellness Portal | Auth+Org | Metrics, appointments, program progress |
| `/provider/dashboard` | Provider Dashboard | Auth+Provider | Schedule, bookings, session notes, availability |

---

## Design System

### Palette (Warm Amber/Sandstone)

| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#f6f5f1` | Page background |
| `--bg-surface` | `#ffffff` | Cards, modals, dropdowns |
| `--bg-subtle` | `#fdf6ed` | Active states, hover rows |
| `--border` | `#e5e0db` | Card borders, dividers |
| `--text-primary` | `#2c241f` | Headings, body text |
| `--text-muted` | `#6f5b4e` | Labels, secondary text |
| `--accent` | `#92400E` | Primary buttons, active states (amber-800) |
| `--success` | `#16a34a` | Verified badges, positive deltas |
| `--warning` | `#d97706` | Moderate risk indicators |
| `--danger` | `#dc2626` | Panic, high risk, delete actions |

### Dark Mode

```css
.dark {
  --bg-canvas:    #14110f;
  --bg-surface:   #1c1815;
  --bg-subtle:    #221d19;
  --border:       #2c241f;
  --text-primary: #f5efe8;
  --text-muted:   #b8a99a;
  --accent:       #f59e0b;
}
```

### Typography

- **Sans**: `Inter` (UI body, headings)
- **Mono**: `Geist Mono` (KPI numbers, code, IDs)
- **Ethiopic**: `Noto Serif Ethiopic` (Amharic script)

### Component Library (Unified)

All dashboards share a common component library:

| Component | Description |
|---|---|
| **KpiCard** | White card with 4px accent bar, label, large value, delta chip, sparkline |
| **SectionCard** | White card with optional title row + actions |
| **ChartCard** | Section card with Recharts (280–320px height) |
| **DataTable** | Rounded border, sticky header, zebra rows, kebab menu |
| **Skeleton** | `animate-pulse` gradient shimmer |
| **EmptyState** | Centered icon + title + description + CTA |
| **ErrorState** | Red icon + title + retry button + error code |
| **ButtonPrimary** | `bg-[#92400E] text-white rounded-lg` |
| **ButtonGhost** | `bg-transparent text-[#6f5b4e] hover:bg-[#f6f5f1]` |
| **ButtonDanger** | `bg-[#dc2626] text-white` |
| **Badge** | `text-[10px] font-semibold px-2 py-0.5 rounded-full` (12 variants) |
| **ProgressBar** | 6px height, amber fill, animated |
| **RingProgress** | SVG circular progress for streaks |
| **PanicButton** | Fixed red pill/bottom-right circle, always visible |

### Layout

- Max canvas: `max-w-[1440px] mx-auto`
- Sidebar: 256px expanded / 64px collapsed
- Top bar: 56px sticky
- Page padding: `px-6 py-6 lg:px-8 lg:py-8`
- Border radius: `rounded-xl` (12px) cards, `rounded-lg` (8px) buttons

### Motion & Micro-Interactions

- Page transitions: 180ms ease-out fade
- Card hover: `transition-shadow duration-200 hover:shadow-md`
- Button press: `active:scale-[0.98] transition-transform`
- Number tickers: count-up animation 800ms
- Toast: slide-up + fade 240ms, auto-dismiss 4s
- Charts: data updates animate 600ms
- `prefers-reduced-motion`: disable non-essential animation

### Accessibility (WCAG 2.1 AA)

- Color contrast ≥ 4.5:1 (text) / 3:1 (UI)
- All interactive elements keyboard-navigable
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#92400E]`
- ARIA labels on icon buttons, charts, live regions

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
| `/api/ai/chat` | POST | Multi-purpose AI chat (companion, coping, guidance) |
| `/api/faith/companion` | POST | Multi-faith spiritual companion (Ethiopian context) |

### Panic

| Route | Method | Description |
|---|---|---|
| `/api/panic` | POST | Insert panic habit_log, AI coping steps, guardian notification |
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

## Database Schema

Core tables (see `scripts/schema.sql` for full DDL):

| Table | Purpose |
|---|---|
| `profiles` | User profiles with aliases, language, preferences |
| `streaks` | Recovery streak tracking (current, longest, total clean days) |
| `habit_logs` | Daily check-in history (mood, stress, urge, substance use, triggers, journal) |
| `panic_events` | Crisis intervention logs |
| `guardian_controls` | Guardian relationships with cryptographic tokens |
| `guardian_notifications` | Notification queue for guardians |
| `providers` | Healthcare, spiritual, and community providers directory |
| `telehealth_bookings` | Session scheduling with status tracking |
| `anonymous_chat` | Community chat messages with moderation flags |
| `faith_programs` | Spiritual program definitions and enrollments |

---

## Seed Data System

### Standalone Script

```bash
npx tsx scripts/seed.ts              # Run all seed types
npx tsx scripts/seed.ts users logs   # Run specific types
npx tsx scripts/seed.ts clear        # Clear all data
```

### Seed Contents

| Entity | Count | Details |
|---|---|---|
| Profiles | 26 | 25 seed + 1 demo (Biruk-Eagle-28) |
| Habit Logs | ~1560 | 60 days × 26 users, realistic mood sine waves |
| Providers | 9 | 8 verified + 1 pending |
| Chat Messages | 50 | Mix of text/milestone_shares, 1 flagged as aggressive |
| Guardians | 3 | 2 seed + 1 for demo with known token |
| Bookings | 5 | 4 seed + 1 demo (Dr. Hiwot, tomorrow 10AM) |
| Faith Program | 1 | Demo enrolled in Restoration Fellowship Week 4 |

### Demo Account

- **Alias**: Biruk-Eagle-28
- **Streak**: 28-day current streak
- **Guardian Token**: `demo-guardian-token-safeground-2024`
- **Booking**: Dr. Hiwot Bekele, tomorrow 10:00 AM
- **Faith Program**: Restoration Fellowship, Week 4

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

## Mobile Navigation

| Icon | Route |
|---|---|
| 🏠 Home | `/` |
| 📊 Dashboard | `/dashboard` |
| 🚨 Panic | `/panic` |
| 💬 Chat | `/chat` |
| 👤 Profile | `/settings` |

## Desktop Sidebar

Dashboard · Daily Check-In · Panic Center · Chat Rooms · Professional Support · Faith Support · Guardian · Profile · Settings · Admin · Logout

---

*SafeGround © 2026 — Privacy First · No Tracking · No Device Fingerprinting · No Public Profiles*
