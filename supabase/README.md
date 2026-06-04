# Supabase setup

Your app expects tables in the **`public`** schema. They are **not** created automatically — you must run the SQL migration once.

## One-time: create all tables

1. Open your project SQL Editor:  
   [https://supabase.com/dashboard/project/ctgxllsmgasucwkujecp/sql/new](https://supabase.com/dashboard/project/ctgxllsmgasucwkujecp/sql/new)
2. Open `supabase/migrations/00_full_schema.sql` in this repo.
3. Copy the **entire file** and paste into the SQL Editor.
4. Click **Run** (you should see “Success”).
5. Go to **Database** → **Tables** — you should see:

   | Table | Purpose |
   |--------|---------|
   | `profiles` | User settings after onboarding |
   | `streaks` | Clean-day streak counters |
   | `habit_logs` | Daily mood logs + panic sessions |
   | `bookings` | Directory session bookings |
   | `anonymous_chat` | Community chat + milestones |
   | `guardian_links` | Guardian invite tokens |

6. **Database** → **Replication** → enable **`anonymous_chat`** for Realtime (required for live chat).

### Verify

In SQL Editor, run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'streaks', 'habit_logs', 'bookings',
    'anonymous_chat', 'guardian_links'
  )
order by table_name;
```

You should get **6 rows**.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

`NEXT_PUBLIC_SITE_URL` must match **Authentication** → **URL configuration** → **Site URL**, and include `http://localhost:3000/auth/callback` under **Redirect URLs**.

## Auth & email (local dev)

1. **Authentication** → **Providers** → **Email** → turn **off** “Confirm email” (fastest for hackathons), **or** configure SMTP for production.
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: `http://localhost:3000/auth/callback`

## Existing users (before migration)

If you signed up before running the migration, run once in SQL Editor to backfill profile + streak rows:

```sql
insert into public.profiles (id, alias)
select id, coalesce(raw_user_meta_data ->> 'alias', 'Anonymous')
from auth.users
on conflict (id) do nothing;

insert into public.streaks (user_id)
select id from auth.users
on conflict (user_id) do nothing;
```

## Individual migrations

If you prefer smaller files, run in order:

1. `20240604120000_anonymous_chat.sql`
2. `20240604120100_guardian_links.sql`
3. `20240604120200_realtime_anonymous_chat.sql`

Or use the all-in-one `00_full_schema.sql` (recommended).
