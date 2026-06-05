<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║      ███████╗ █████╗ ███████╗███████╗ ██████╗ ██████╗  ██████╗ ██╗   ██╗      ║
║      ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝ ██╔══██╗██╔═══██╗██║   ██║      ║
║      ███████╗███████║█████╗  █████╗  ██║  ███╗██████╔╝██║   ██║██║   ██║      ║
║      ╚════██║██╔══██║██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██║   ██║      ║
║      ███████║██║  ██║██║     ███████╗╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝      ║
║      ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝       ║
║                                                                              ║
║          Anonymous Recovery & Digital Well-Being Platform                    ║
║                   for Ethiopian Youth                                        ║
║                                                                              ║
║          Recovery · Community · Faith · Dignity · Privacy                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### A Private, Judgment-Free Space for Recovery and Digital Well-Being

**Empowering Ethiopian youth on their journey toward healthier habits,**
**stronger communities, and lasting recovery — anonymously.**

---

![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.107.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

[🌐 Live Demo](#-demo) · [📖 Documentation](AGENTS.md) · [📋 Specification](SPEC.md) · [🐛 Report Bug](https://github.com/lA12-coder/safeground-project/issues)

</div>

---

## About the Project

SafeGround is a comprehensive, privacy-first digital well-being platform built for **Ethiopian university students and youth**. It combines AI-powered tools, anonymous community support, professional telehealth, faith-based programs, and guardian accountability — all behind a zero-log, no-fingerprinting architecture.

### The Problem

Many young Ethiopians struggle silently with:

- **Compulsive pornography use** affecting academic and personal life
- **Digital well-being challenges** including phone dependency and social media overuse
- **Khat-related impulse spikes** and substance use patterns
- **Shame cycles** and social stigma preventing help-seeking
- **Anxiety, stress, and isolation** compounded by addictive behaviors

### Our Solution

SafeGround addresses these challenges through a **privacy-first, multi-stakeholder platform**:

| Stakeholder | What They Get |
|---|---|
| Students | Anonymous tracking, AI companion, crisis support, spiritual guidance |
| Guardians | Read-only support view, encouragement tools, milestone notifications |
| Providers | Verification, booking management, encrypted session notes |
| Organizations | Wellness portal, program management, impact metrics |
| Admins | Real-time metrics, moderation, seed data, system health |

---

## Key Features

### For Students
- **Streak Tracking** — Daily check-ins with milestone celebrations (3/7/14/30/60/90 days)
- **AI-Powered Affirmations** — Gemini-generated personalized encouragement with 20 fallbacks
- **Panic Button** — One-tap crisis intervention with coping steps and streak protection
- **Anonymous Community Chat** — Safe, moderated peer support rooms
- **Spiritual Companion** — Multi-faith guidance (Orthodox, Protestant, Catholic, Muslim, Custom)
- **Provider Directory** — Filter by city, language, online/in-person, pro-bono
- **Telehealth Bookings** — Schedule sessions with verified providers
- **Anonymous Aliases** — Identity protection through generated aliases

### For Guardians
- Token-gated access — no account required, secure link sharing
- Real-time recovery progress (streaks, moods)
- Encouragement cards — send faith/calm/encourage messages
- Privacy-first — never sees triggers, relapses, or flagged content
- Panic notifications when loved ones need support
- Bilingual interface (Amharic/English)

### For Providers
- Verified profiles with admin approval
- Smart booking management (confirm, reschedule, cancel)
- Encrypted session notes for secure documentation
- Visual availability calendar with weekly slot management
- Session types: Initial / Follow-up / Crisis

### For Organizations
- Easy 4-step registration with document upload
- Wellness portal with participant and engagement metrics
- Program management and schedule tracking
- Multi-language support

### For Admins
- Real-time dashboard with regional Ethiopia map
- Moderation queue for community messages
- Provider verification workflow
- Seed data system (7 types + reset + clear all)
- 30-day analytics with Recharts visualizations

### AI-Powered Features
- Gemini integration for context-aware responses
- Smart affirmations with graceful fallback
- Crisis-specific coping strategies
- Multi-faith spiritual companion
- CBT urge-surfing coach

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Supabase (Auth, PostgreSQL, Realtime), Google Gemini AI |
| **Tooling** | pnpm, Vercel, next-themes, qrcode.react, Geist font |

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or 20+ or 22+
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/lA12-coder/safeground-project.git
cd safeground-project

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run the database schema in Supabase SQL Editor
# (see scripts/schema.sql)

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Demo Data

```bash
npx tsx scripts/seed.ts
```

### Demo Account

- **Guardian Token**: `demo-guardian-token-safeground-2024`
- **Features**: 28-day streak, active booking, faith program enrollment

---

## Documentation

| Document | Description |
|---|---|
| [AGENTS.md](AGENTS.md) | Technical reference — architecture, routes, components, design system |
| [SPEC.md](SPEC.md) | Complete MVP specification — user flows, page details, design tokens |

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint code quality check |
| `pnpm type-check` | TypeScript compiler check |
| `npx tsx scripts/seed.ts` | Seed all demo data |
| `npx tsx scripts/seed.ts clear` | Clear all data |

---

## Architecture

```
                     ┌─────────────────────┐
                     │   SAFEGROUND CORE   │
                     │  Next.js 16 + RSC   │
                     └──────────┬──────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│   PUBLIC ZONE  │      │  AUTHENTICATED │      │    ADMIN ZONE  │
│                │      │      ZONE      │      │                │
│  /             │      │  /dashboard/*  │      │  /admin/*      │
│  /guest        │      │  /settings/*   │      │  (admin email) │
│  /register     │      │  /provider/*   │      │                │
│  /login        │      │  /org/portal/* │      │                │
│  /guardian/*   │      │  (onboarding)  │      │                │
│  /org/register │      │                │      │                │
└────────┬───────┘      └────────┬───────┘      └────────┬───────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
       ┌──────────────────┐            ┌──────────────────┐
       │  Supabase (DB)   │            │  Google Gemini   │
       │  Auth (SSR)      │            │  AI              │
       │  RLS Policies    │            │  Affirmations    │
       │  Realtime        │            │  Companion       │
       │                  │            │  Coping Steps    │
       └──────────────────┘            └──────────────────┘
```

---

## Security & Privacy

- **Anonymous Aliases** — No PII in user interface
- **Zero-Log Architecture** — No device fingerprinting, no tracking scripts
- **Local Encryption** — Private journal stays on device, never uploaded
- **Guardian Tokens** — 32-byte cryptographically secure random tokens
- **Soft Deletes** — Moderation preserves data integrity
- **Rate Limiting** — Guest chat limited to 20 messages per session
- **RLS Policies** — Row-level security on all Supabase tables

---

## License

Distributed under the MIT License.

---

*SafeGround © 2026 — Privacy First · No Tracking · No Device Fingerprinting · No Public Profiles*
