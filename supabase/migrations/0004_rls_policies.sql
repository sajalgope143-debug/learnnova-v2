-- ============================================================
-- LearnSphere: Row Level Security
-- Every table with user-facing data is locked down by default;
-- policies below grant the minimum access required.
-- ============================================================

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: is the current user an instructor who owns this course?
create or replace function public.owns_course(target_course_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.courses
    where id = target_course_id and instructor_id = auth.uid()
  );
$$ language sql security definer stable;

-- ── profiles ─────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- ── categories & courses (public read, admin/instructor write) ─
alter table public.categories enable row level security;
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin());

alter table public.courses enable row level security;
create policy "courses_public_read_published" on public.courses
  for select using (status = 'published' or public.is_admin() or instructor_id = auth.uid());
create policy "courses_instructor_write" on public.courses
  for insert with check (instructor_id = auth.uid() or public.is_admin());
create policy "courses_instructor_update" on public.courses
  for update using (instructor_id = auth.uid() or public.is_admin());

-- ── chapters & lessons (visible if course visible; content gated) ─
alter table public.chapters enable row level security;
create policy "chapters_read" on public.chapters
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and (c.status = 'published' or public.is_admin() or c.instructor_id = auth.uid()))
  );
create policy "chapters_write" on public.chapters
  for all using (public.owns_course(course_id) or public.is_admin());

alter table public.lessons enable row level security;
-- Full lesson row (incl. video_url) only for enrolled users, preview lessons, owners, or admins.
create policy "lessons_read" on public.lessons
  for select using (
    is_preview = true
    or public.is_admin()
    or exists (
      select 1 from public.chapters ch join public.courses c on c.id = ch.course_id
      where ch.id = chapter_id and c.instructor_id = auth.uid()
    )
    or exists (
      select 1 from public.chapters ch
      join public.enrollments e on e.course_id = ch.course_id
      where ch.id = chapter_id and e.user_id = auth.uid()
    )
  );
create policy "lessons_write" on public.lessons
  for all using (
    public.is_admin() or exists (
      select 1 from public.chapters ch where ch.id = chapter_id and public.owns_course(ch.course_id)
    )
  );

-- ── enrollments ──────────────────────────────────────────
alter table public.enrollments enable row level security;
create policy "enrollments_read_own" on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());
-- Inserts happen server-side (service role) after payment verification only.

-- ── lesson_progress, bookmarks, wishlists ────────────────
alter table public.lesson_progress enable row level security;
create policy "progress_own" on public.lesson_progress for all using (user_id = auth.uid());

alter table public.bookmarks enable row level security;
create policy "bookmarks_own" on public.bookmarks for all using (user_id = auth.uid());

alter table public.wishlists enable row level security;
create policy "wishlists_own" on public.wishlists for all using (user_id = auth.uid());

-- ── reviews (public read, own write) ─────────────────────
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select using (is_approved = true or public.is_admin());
create policy "reviews_own_write" on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews_own_update" on public.reviews for update using (user_id = auth.uid() or public.is_admin());

-- ── certificates ─────────────────────────────────────────
alter table public.certificates enable row level security;
create policy "certificates_own_read" on public.certificates for select using (user_id = auth.uid() or public.is_admin());

-- ── notifications ────────────────────────────────────────
alter table public.notifications enable row level security;
create policy "notifications_own" on public.notifications for all using (user_id = auth.uid());

-- ── support tickets ──────────────────────────────────────
alter table public.support_tickets enable row level security;
create policy "tickets_own_or_staff" on public.support_tickets
  for select using (user_id = auth.uid() or public.is_admin());
create policy "tickets_own_insert" on public.support_tickets
  for insert with check (user_id = auth.uid());

alter table public.ticket_replies enable row level security;
create policy "ticket_replies_participants" on public.ticket_replies
  for select using (
    exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or public.is_admin()))
  );

-- ── orders (own read; writes via service role only) ──────
alter table public.orders enable row level security;
create policy "orders_own_read" on public.orders for select using (user_id = auth.uid() or public.is_admin());

-- ── coupons (admin only visibility of full row; validation via API) ─
alter table public.coupons enable row level security;
create policy "coupons_admin_all" on public.coupons for all using (public.is_admin());

-- ── referral earnings, wallet, payout methods, withdrawals ─
alter table public.referral_earnings enable row level security;
create policy "referral_earnings_own_read" on public.referral_earnings
  for select using (referrer_id = auth.uid() or public.is_admin());

alter table public.wallets enable row level security;
create policy "wallets_own_read" on public.wallets for select using (user_id = auth.uid() or public.is_admin());

alter table public.wallet_transactions enable row level security;
create policy "wallet_tx_own_read" on public.wallet_transactions
  for select using (
    exists (select 1 from public.wallets w where w.id = wallet_id and (w.user_id = auth.uid() or public.is_admin()))
  );

alter table public.payout_methods enable row level security;
create policy "payout_methods_own" on public.payout_methods for all using (user_id = auth.uid());

alter table public.withdrawal_requests enable row level security;
create policy "withdrawals_own_read" on public.withdrawal_requests
  for select using (user_id = auth.uid() or public.is_admin());
create policy "withdrawals_own_insert" on public.withdrawal_requests
  for insert with check (user_id = auth.uid());
create policy "withdrawals_admin_update" on public.withdrawal_requests
  for update using (public.is_admin());

-- ── site settings & banners (public read, admin write) ───
alter table public.site_settings enable row level security;
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for update using (public.is_admin());

alter table public.banners enable row level security;
create policy "banners_public_read" on public.banners for select using (is_active = true or public.is_admin());
create policy "banners_admin_write" on public.banners for all using (public.is_admin());
