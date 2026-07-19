# LearnSphere — Full-Stack Course Selling Platform

A production-ready online learning platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** (Postgres + Auth + Storage). Includes student & instructor dashboards, an admin panel, Razorpay/Cashfree payments, a referral & wallet system, video/PDF/quiz lessons, and bilingual (English/Bengali) support.

> This is an original design and codebase — no UI, branding, or content copied from any existing platform.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — Email/Password, Google OAuth, Phone OTP |
| Payments | Razorpay + Cashfree |
| Storage | Cloudflare R2 (video/PDF) — swap for Supabase Storage if preferred |
| Charts | Recharts |
| Deployment | Vercel (frontend + API routes), Supabase (managed Postgres) |

---

## 2. Project Structure

```
src/
  app/
    (public)/          # Home, About, Pricing, FAQ, Contact, Legal, Courses, Checkout
    (auth)/             # Login, Signup, Forgot/Reset Password, OTP Login, Verify Email
    (dashboard)/        # Student dashboard: courses, wallet, referrals, settings...
    (admin)/            # Admin panel: users, courses, payments, coupons, analytics...
    learn/[courseSlug]/[lessonId]/   # Course player (video/pdf/quiz)
    api/                # All backend route handlers
    auth/callback/      # OAuth callback handler
  components/
    layout/ home/ course/ dashboard/ admin/ auth/  ui/
  lib/
    supabase/           # client.ts (browser), server.ts (SSR), admin.ts (service role)
    payments/           # Razorpay, Cashfree, shared order-service.ts
    validators/         # Zod schemas
    utils/              # rate-limit.ts, etc.
  types/                # Shared TypeScript types mirroring the DB schema
  i18n/                 # Dictionary loader for English/Bengali
supabase/
  migrations/           # SQL migrations — run in order 0001 → 0005
  seed.sql              # Sample categories, badges, referral rules
public/locales/         # en/bn translation JSON
```

---

## 3. Prerequisites

- Node.js 18.18+ (Next.js 14 requirement)
- A [Supabase](https://supabase.com) project (free tier is enough to start)
- A [Razorpay](https://razorpay.com) account (test mode keys are free)
- A [Cashfree](https://www.cashfree.com) account (sandbox mode)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (or use Supabase Storage instead — see note below)

---

## 4. Local Setup

### 4.1 Clone & install

```bash
npm install
```

### 4.2 Configure environment variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local`. See section 6 below for where each key comes from.

### 4.3 Set up the database

Install the Supabase CLI if you haven't:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Push the schema:

```bash
supabase db push
```

This runs all files in `supabase/migrations/` in order:
1. `0001_core_schema.sql` — users, courses, chapters, lessons, quizzes
2. `0002_learning_schema.sql` — enrollments, progress, reviews, certificates, notifications
3. `0003_commerce_schema.sql` — orders, coupons, referrals, wallet, withdrawals
4. `0004_rls_policies.sql` — Row Level Security policies (critical — do not skip)
5. `0005_signup_triggers.sql` — auto-creates profile + wallet on signup

Then seed sample data:

```bash
psql "$YOUR_SUPABASE_CONNECTION_STRING" -f supabase/seed.sql
```

(Or paste `seed.sql`'s contents into the Supabase SQL Editor.)

### 4.4 Configure Supabase Auth providers

In the Supabase Dashboard → Authentication → Providers:

- **Email**: enable "Confirm email" for production
- **Google**: enable, and add your `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (from Google Cloud Console → OAuth consent screen + credentials). Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console.
- **Phone**: enable, and connect an SMS provider (Twilio, MessageBird, or Vonage are natively supported by Supabase)

### 4.5 Create your first admin user

Sign up normally through the app, then promote yourself in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where id = 'YOUR_USER_UUID';
```

### 4.6 Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 5. Payment Gateway Setup

### Razorpay

1. Get your test **Key ID** and **Key Secret** from Razorpay Dashboard → Settings → API Keys.
2. Set up a webhook: Dashboard → Settings → Webhooks → Add New Webhook
   - URL: `https://yourdomain.com/api/payments/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Copy the generated **Webhook Secret** into `RAZORPAY_WEBHOOK_SECRET`

### Cashfree

1. Get your **App ID** and **Secret Key** from Cashfree Dashboard → Developers → API Keys (use Sandbox first).
2. Set up a webhook: Dashboard → Developers → Webhooks
   - URL: `https://yourdomain.com/api/payments/cashfree/webhook`
   - Copy the **Webhook Secret** into `CASHFREE_WEBHOOK_SECRET`

> **Important:** both webhook routes verify the request signature before trusting any payload — never disable this check in production.

---

## 6. Environment Variables Reference

See `.env.example` for the full list. Key sources:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (⚠️ keep secret, server-only) |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google Cloud Console → Credentials |
| `RAZORPAY_KEY_ID` / `SECRET` / `WEBHOOK_SECRET` | Razorpay Dashboard |
| `CASHFREE_APP_ID` / `SECRET_KEY` / `WEBHOOK_SECRET` | Cashfree Dashboard |
| `R2_*` | Cloudflare Dashboard → R2 → Manage API Tokens |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) (for AI chat support) |

---

## 7. Video/PDF Storage Note

This project references Cloudflare R2 URLs directly in the `lessons.video_url` / `lessons.pdf_url` columns. Two ways to populate them:

1. **Cloudflare R2** (recommended for cost at scale): upload via the R2 dashboard or `aws s3` CLI (R2 is S3-compatible), make the bucket public or use signed URLs, then paste the resulting URL when creating a lesson.
2. **Supabase Storage** (simpler if you want everything in one place): create a `course-content` bucket, upload files, and use the public/signed URL the same way.

For paid courses, non-preview lesson URLs are only ever returned by the API to enrolled users — enforced both by the RLS policy on `lessons` and by the API route logic.

---

## 8. Deployment

### Frontend + API routes → Vercel

```bash
npm install -g vercel
vercel
```

- Add all environment variables from `.env.local` to Vercel Project Settings → Environment Variables.
- Set `NEXT_PUBLIC_SITE_URL` to your production domain.
- Update the Razorpay/Cashfree webhook URLs and Google OAuth redirect URI to point at your production domain once deployed.

### Database → Supabase

Already managed — no separate deployment step needed. Just make sure migrations are pushed to your production Supabase project (`supabase link` to the prod project ref, then `supabase db push`).

### Post-deploy checklist

- [ ] Run all 5 migrations + seed data on the production database
- [ ] Promote at least one user to `admin` role
- [ ] Switch Razorpay/Cashfree from sandbox to live keys
- [ ] Update webhook URLs in both payment dashboards to production URLs
- [ ] Verify Google OAuth redirect URI matches production domain
- [ ] Set `CASHFREE_ENV=PRODUCTION` in env vars
- [ ] Test the full flow: signup → browse → enroll → pay → course unlock → certificate

---

## 9. Feature Checklist

- [x] Public pages: Home, About, Contact, Pricing, FAQ, Privacy/Terms/Refund
- [x] Auth: Email/Password, Google, OTP, forgot/reset password, email verification
- [x] Student dashboard: courses, progress, certificates, wallet, referrals, payments, notifications, settings
- [x] Course system: categories, chapters, lessons, video/PDF/quiz, progress save, bookmarks, reviews
- [x] Payments: Razorpay + Cashfree, coupons, invoices, auto-unlock via webhook
- [x] Referral system: unique links, dashboard, earnings, commission rules, wallet, withdrawals
- [x] Admin panel: users, courses, categories, payments, coupons, referrals, withdrawals, reviews, analytics, settings, banners, tickets
- [x] Security: RLS on every table, rate limiting, Zod validation, signed webhook verification
- [x] SEO: dynamic sitemap.xml, robots.txt, per-page metadata
- [x] Bilingual: English + Bengali translation dictionaries
- [x] Extras: wishlist, leaderboard, streaks, badges (schema + auto-award trigger points), AI chat support

---

## 10. Notes on What to Extend Next

This codebase is a complete, working foundation — a few areas are intentionally left as extension points rather than fully built out, since they depend on business specifics:

- **Instructor course-builder UI** (uploading chapters/lessons/quiz questions via a form) — the API and schema fully support it; only the admin UI forms for chapters/lessons need to be added following the same pattern as `NewCourseForm`.
- **Invoice PDF generation** — `orders.invoice_url` is a plain column; wire up a PDF generation library (e.g. `@react-pdf/renderer`) triggered after `fulfillOrder`.
- **Push notifications** — the `notifications` table and in-app UI are complete; wiring Firebase Cloud Messaging for actual push delivery is a small addition on top.
- **Live classes** — would need a video conferencing integration (e.g. Zoom SDK, Daily.co, or LiveKit) plus a `live_sessions` table.
