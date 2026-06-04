# SafeGround — Authentication Guide

## Demo Accounts

These are hardcoded in `app/(auth)/login/page.tsx:9-13`. Click the button on the login page to sign in instantly.

| Role | Email | Password | Redirect |
|---|---|---|---|
| **Admin** | `admin@gmail.com` | `SafeGroundAdmin123!` | `/admin` |
| **Student** | `demo.student@safeground.test` | `SafeGroundStudent123!` | `/dashboard` |
| **Provider** | `provider@safeground.test` | `SafeGroundProvider123!` | `/provider/dashboard` |

## Admin Access

- The admin email list is configured via the `ADMIN_EMAILS` env var (see `.env.local.example`):
  ```
  ADMIN_EMAILS=admin@gmail.com,superadmin@gmail.com
  ```
- A hardcoded fallback list exists at `app/(auth)/login/page.tsx:45`:
  ```typescript
  const adminEmails = ['admin@gmail.com', 'superadmin@gmail.com']
  ```
- Middleware (`middleware.ts:46-47`) protects `/admin/*` routes by checking `supabase.auth.getUser().email` against `ADMIN_EMAILS`.

## Demo Seed User (for dashboard demo)

| Field | Value |
|---|---|
| Alias | Biruk-Eagle-28 |
| Internal ID | `demo-user` |
| Current Streak | 28 days |
| Guardian Token | `demo-guardian-token-safeground-2024` |
| Region | Addis Abeba |
| Religion | Orthodox |
| Support Preference | Secular |

Created by `scripts/seed.ts` (standalone) or `POST /api/admin/seed?type=demo` (API).

## Supabase Auth

Auth is handled via Supabase (`@supabase/supabase-js`) with three client configurations:

| File | Purpose |
|---|---|
| `lib/supabase/client.ts` | Browser client (`createBrowserClient`) |
| `lib/supabase/server.ts` | RSC server client (`createServerClient`) |
| `lib/supabase/middleware.ts` | Edge middleware (`createServerClient`) |

## Route Protection (middleware.ts)

| Path | Access |
|---|---|
| `/`, `/guest`, `/register`, `/login`, `/onboarding` | Public |
| `/guardian/*`, `/org/register` | Public (token-gated) |
| `/admin/*` | Auth required + email in `ADMIN_EMAILS` |
| `/dashboard/*`, `/settings/*`, `/provider/*`, `/org/portal/*` | Auth + `onboarding_done` check |

## Registration Flow

`/register` → Supabase `signUp` → redirect to `/onboarding` → profile setup → `/dashboard`.
