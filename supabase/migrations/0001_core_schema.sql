-- ============================================================
-- LearnSphere: Core Schema
-- Users, Roles, Categories, Courses, Chapters, Lessons
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────
create type user_role as enum ('student', 'instructor', 'admin', 'support');
create type course_status as enum ('draft', 'published', 'archived');
create type lesson_type as enum ('video', 'pdf', 'quiz', 'assignment');
create type order_status as enum ('created', 'paid', 'failed', 'refunded');
create type payment_gateway as enum ('razorpay', 'cashfree');
create type withdraw_status as enum ('pending', 'approved', 'rejected', 'paid');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

-- ── Profiles (extends Supabase auth.users) ──────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  phone text unique,
  role user_role not null default 'student',
  bio text,
  language text not null default 'en' check (language in ('en', 'bn')),
  referral_code text unique not null default substr(md5(random()::text), 1, 8),
  referred_by uuid references public.profiles(id),
  streak_count int not null default 0,
  last_activity_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_referral_code on public.profiles(referral_code);
create index idx_profiles_referred_by on public.profiles(referred_by);

-- ── Categories ───────────────────────────────────────────
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  parent_id uuid references public.categories(id),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Courses ──────────────────────────────────────────────
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  subtitle text,
  description text,
  thumbnail_url text,
  preview_video_url text,
  category_id uuid references public.categories(id),
  instructor_id uuid not null references public.profiles(id),
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  currency text not null default 'INR',
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  language text not null default 'en',
  status course_status not null default 'draft',
  duration_minutes int not null default 0,
  total_students int not null default 0,
  average_rating numeric(2,1) not null default 0,
  total_reviews int not null default 0,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_courses_slug on public.courses(slug);
create index idx_courses_category on public.courses(category_id);
create index idx_courses_status on public.courses(status);
create index idx_courses_featured on public.courses(is_featured) where is_featured = true;

-- ── Chapters ─────────────────────────────────────────────
create table public.chapters (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_chapters_course on public.chapters(course_id);

-- ── Lessons ──────────────────────────────────────────────
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  type lesson_type not null default 'video',
  video_url text,
  video_duration_seconds int,
  pdf_url text,
  content text,
  is_preview boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_lessons_chapter on public.lessons(chapter_id);

-- ── Quizzes ──────────────────────────────────────────────
create table public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null,
  options jsonb not null, -- ["Option A", "Option B", ...]
  correct_option_index int not null,
  display_order int not null default 0
);

create table public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id),
  score numeric(5,2) not null,
  answers jsonb not null,
  attempted_at timestamptz not null default now()
);

-- ── Assignments ──────────────────────────────────────────
create table public.assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id),
  user_id uuid not null references public.profiles(id),
  submission_url text,
  submission_text text,
  grade numeric(5,2),
  feedback text,
  submitted_at timestamptz not null default now()
);

-- ── updated_at trigger helper ────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
