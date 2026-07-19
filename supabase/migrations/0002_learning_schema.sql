-- ============================================================
-- LearnSphere: Learning & Engagement Schema
-- Enrollments, Progress, Reviews, Wishlist, Certificates, Badges
-- ============================================================

-- ── Enrollments (course unlock after payment) ───────────
create table public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  order_id uuid, -- linked after payments table is created (0003)
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  progress_percent numeric(5,2) not null default 0,
  unique (user_id, course_id)
);
create index idx_enrollments_user on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);

-- ── Lesson progress ──────────────────────────────────────
create table public.lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id),
  course_id uuid not null references public.courses(id),
  is_completed boolean not null default false,
  last_position_seconds int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index idx_progress_user_course on public.lesson_progress(user_id, course_id);

-- ── Bookmarks ────────────────────────────────────────────
create table public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id),
  note text,
  timestamp_seconds int,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id, timestamp_seconds)
);

-- ── Wishlist ─────────────────────────────────────────────
create table public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ── Reviews & Ratings ────────────────────────────────────
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id),
  user_id uuid not null references public.profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);
create index idx_reviews_course on public.reviews(course_id);

-- Recalculate course rating whenever a review changes
create or replace function public.refresh_course_rating()
returns trigger as $$
begin
  update public.courses c
  set average_rating = coalesce((
        select round(avg(r.rating)::numeric, 1)
        from public.reviews r
        where r.course_id = coalesce(new.course_id, old.course_id)
          and r.is_approved = true
      ), 0),
      total_reviews = (
        select count(*) from public.reviews r
        where r.course_id = coalesce(new.course_id, old.course_id)
          and r.is_approved = true
      )
  where c.id = coalesce(new.course_id, old.course_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger trg_review_rating_insupd
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_course_rating();

-- ── Certificates ─────────────────────────────────────────
create table public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  certificate_code text unique not null default upper(substr(md5(random()::text), 1, 10)),
  issued_at timestamptz not null default now(),
  pdf_url text,
  unique (user_id, course_id)
);

-- ── Badges / Achievements ────────────────────────────────
create table public.badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  icon text,
  criteria jsonb -- e.g. {"type": "streak", "value": 7}
);

create table public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  badge_id uuid not null references public.badges(id),
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ── Notifications ────────────────────────────────────────
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  title text not null,
  message text,
  type text not null default 'info', -- info | payment | course | referral | system
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id, is_read);

-- ── Support tickets ──────────────────────────────────────
create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  subject text not null,
  message text not null,
  status ticket_status not null default 'open',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_replies (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);
