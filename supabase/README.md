# Supabase setup

All database tables live in **one migration file**. Run it once in the SQL Editor.

## One-time setup

1. Open **Supabase Dashboard → SQL → New query**
2. Open **`supabase/migrations/00_full_schema.sql`** in this repo
3. Copy the **entire file**, paste into the editor, click **Run**
4. **Database → Replication** → enable **`anonymous_chat`** (required for live chat)
5. Seed demo data (optional):
   ```bash
   npx tsx scripts/seed.ts
   npx tsx scripts/seedKnowledgeBase.ts   # needs OPENAI_API_KEY in .env.local
   ```

## What this creates

| Table | Purpose |
|--------|---------|
| `profiles` | User settings, religion, onboarding |
| `streaks` | Clean-day streak counters |
| `habit_logs` | Daily check-ins + panic (legacy + app columns) |
| `providers` | Clinical + faith orgs + spiritual teachers |
| `telehealth_bookings` | Session bookings + payment fields |
| `bookings` | Legacy booking fallback |
| `anonymous_chat` | Community chat + moderation |
| `guardian_controls` | Guardian invite tokens |
| `notification_logs` | In-app notifications |
| `milestones` | Streak milestone achievements |
| `knowledge_base` | RAG embeddings for AI chat |

## Verify

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Re-running

The migration is **idempotent** (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Safe to run again after partial setups or schema drift.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key   # RAG embeddings only
```

## Other migration files

Files `01_*` through `04_*` and dated `20240604_*` migrations are **legacy**. Use **`00_full_schema.sql` only**.
