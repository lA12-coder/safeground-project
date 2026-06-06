# SafeGround — Netlify Deployment Guide

## Overview
SafeGround is a Next.js full-stack application. Netlify hosting requires proper environment configuration and build settings.

---

## Prerequisites

✅ **Before Deploying:**
1. Supabase project with fully migrated schema
2. Gemini API key (or alternative AI provider)
3. GitHub repository connected to Netlify
4. Admin email list for access control
5. Your public deployment URL (e.g., `https://safeground.netlify.app`)

---

## Step 1: Connect Repository to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** provider
4. Authorize Netlify access to your repositories
5. Choose: `lA12-coder/safeground-project` (or your fork)
6. Click **"Deploy site"**

Netlify auto-detects `netlify.toml` configuration.

---

## Step 2: Configure Environment Variables

⚠️ **CRITICAL: Never commit real `.env` files!**

In Netlify UI:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"** and add:

```env
# Public variables (safe to expose in frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app

# Secret variables (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-2.0-flash
ADMIN_SECRET_KEY=your-admin-secret-key-here
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

3. Click **"Save"**

---

## Step 3: Configure Build Settings

Netlify should auto-detect from `netlify.toml`, but verify:

**Build & Deploy** → **Build settings**:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20.13.0` (or latest LTS)
- **Build timeout**: `15 min`

---

## Step 4: First Deployment

1. **Manual trigger** (if needed):
   - Site overview → **Trigger deploy** → **Deploy site**
   
2. **Auto-deploy on push**:
   - Any commit to `main` branch auto-deploys
   - Pull requests generate preview URLs

3. **Monitor deployment**:
   - **Deployments** tab shows build logs
   - Logs show: install → build → deploy

**Expected build time**: 2–4 minutes

---

## Step 5: Post-Deployment Verification

### Test Core Features
- [ ] Auth: Login/Register at `/login`
- [ ] Dashboard: Check `/dashboard` after login
- [ ] Admin: Verify `/admin` access with correct `ADMIN_EMAILS`
- [ ] API: Test `/api/habits/streak` via curl or browser
- [ ] Chat: Guest chat at `/guest/page` works
- [ ] Guardian: Public token links at `/guardian/[token]` accessible

### Check Logs
```bash
# Netlify functions logs
netlify logs --function=next

# Real-time logs in UI
Site → Logs → Netlify Functions
```

---

## Step 6: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add domain"** or **"Add custom domain"**
3. Enter your domain (e.g., `safeground.app`)
4. Update DNS records:
   - **CNAME**: `your-site.netlify.app` (if subdomain)
   - **A record**: Netlify's IP (auto-assigned)
5. Wait for DNS propagation (5–48 hours)

---

## Troubleshooting

### Issue: Build Fails with "npm: command not found"
**Solution**: Set `NODE_VERSION` env var in Netlify UI to `20.13.0`

### Issue: "SUPABASE_SERVICE_ROLE_KEY is undefined"
**Solution**: 
- Verify variable in **Environment** settings
- Ensure it's **not prefixed** with `NEXT_PUBLIC_`
- Server routes can access it via `process.env.SUPABASE_SERVICE_ROLE_KEY`

### Issue: "Cannot find module 'gemini'"
**Solution**: 
- Verify all dependencies installed: `npm install`
- Check `package.json` includes `@google/generative-ai`
- Re-trigger build in Netlify

### Issue: Auth Redirects Failing
**Solution**:
- Update `NEXT_PUBLIC_SITE_URL` to your Netlify URL
- Update Supabase auth settings → **Auth Providers** → **Redirect URLs**:
  ```
  https://your-site.netlify.app/auth/callback
  ```

### Issue: Guardian Links 404
**Solution**:
- Public routes must NOT require auth in middleware
- Check `middleware.ts`: `/guardian/*` should be public
- Verify token is 32 bytes (cryptographically secure)

---

## Environment Variables Reference

| Variable | Public | Type | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | String | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | String | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | String | Your deployment URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | String | Same as `SITE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Secret | Service role (server-side) |
| `GEMINI_API_KEY` | ❌ | Secret | Google Gemini API key |
| `GEMINI_MODEL` | ❌ | String | Model: `gemini-2.0-flash` |
| `ADMIN_SECRET_KEY` | ❌ | Secret | Admin session secret |
| `ADMIN_EMAILS` | ❌ | CSV | Comma-separated admin emails |

---

## Monitoring & Logs

**Real-time Logs**:
- **Netlify UI**: Deployments → select deployment → Functions
- **CLI**: `netlify logs --function=next --tail`

**Common Log Messages**:
- ✅ `Build succeeded` → Ready to serve
- ⚠️ `Attempted to write to read-only filesystem` → `.next/cache` build issue
- ❌ `SyntaxError in middleware.ts` → TypeScript error

---

## CI/CD Pipeline

### Auto-Deploy on Git Push
Netlify automatically:
1. Listens to GitHub webhooks
2. Clones latest code
3. Runs `npm run build`
4. Deploys to production

### Deploy Previews (PR Builds)
- Create pull request → GitHub notifies Netlify
- Netlify builds preview URL (e.g., `deploy-preview-42--safeground.netlify.app`)
- Team can test changes before merge
- Auto-deploys when PR merges to `main`

### Roll Back
- **Deployments** tab → select previous deployment → **Publish deploy**

---

## Security Best Practices

✅ **DO:**
- Store secrets in Netlify **Environment** settings
- Use `.env.local.example` as template (never `.env`)
- Keep `SUPABASE_SERVICE_ROLE_KEY` private
- Rotate `ADMIN_SECRET_KEY` regularly
- Monitor admin logs

❌ **DON'T:**
- Commit `.env` files to git
- Expose API keys in frontend code
- Use weak `ADMIN_SECRET_KEY` values
- Share deployment URLs with untrusted users

---

## Performance Optimization

### Caching Strategy
Netlify cache headers (see `netlify.toml`):
- **JS/CSS assets**: 1 year (immutable)
- **Static files**: 1 year
- **HTML/JSON**: 5 minutes (revalidated)

### Build Optimization
- Enable [On-Demand Builders](https://docs.netlify.com/functions/overview/) for dynamic routes
- Use `getStaticProps` for pre-rendering user dashboard
- Compress images with Next.js `Image` component

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Configure environment variables in Netlify
3. ✅ Trigger first build
4. ✅ Test core user flows
5. ✅ Update DNS (if using custom domain)
6. ✅ Monitor logs and performance
7. ✅ Set up branch protection rules on GitHub

---

## Support Links

- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Supabase Auth**: https://supabase.com/docs/guides/auth/overview
- **Gemini API**: https://ai.google.dev/docs

---

**SafeGround © 2026 — Privacy First · No Tracking**
