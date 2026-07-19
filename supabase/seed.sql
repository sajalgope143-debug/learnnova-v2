-- ============================================================
-- LearnSphere: Development seed data
-- Run after migrations to populate a working local dataset.
-- ============================================================

insert into public.categories (name, slug, description, icon, display_order) values
  ('Web Development', 'web-development', 'Frontend, backend and full-stack courses', 'code', 1),
  ('Data Science', 'data-science', 'Python, ML, and analytics courses', 'bar-chart', 2),
  ('Design', 'design', 'UI/UX and graphic design courses', 'palette', 3),
  ('Business', 'business', 'Entrepreneurship and management', 'briefcase', 4),
  ('Bengali Language Courses', 'bengali-courses', 'Courses taught fully in Bengali', 'languages', 5);

insert into public.referral_rules (commission_type, commission_value, min_payout_amount)
values ('percent', 10, 500);

insert into public.badges (name, description, icon, criteria) values
  ('First Step', 'Completed your first lesson', 'footprints', '{"type":"lessons_completed","value":1}'),
  ('7-Day Streak', 'Learned 7 days in a row', 'flame', '{"type":"streak","value":7}'),
  ('30-Day Streak', 'Learned 30 days in a row', 'flame', '{"type":"streak","value":30}'),
  ('Course Finisher', 'Completed a full course', 'graduation-cap', '{"type":"course_completed","value":1}'),
  ('Top Referrer', 'Referred 10+ paying students', 'users', '{"type":"referrals","value":10}');

-- Note: instructor/course rows are intentionally left out of the seed —
-- create an instructor account first via signup, then insert courses
-- referencing that profile id, e.g.:
--
-- insert into public.courses (title, slug, description, category_id, instructor_id, price, status)
-- values ('Next.js Mastery', 'nextjs-mastery', 'Build production apps with Next.js',
--   (select id from public.categories where slug = 'web-development'),
--   '<instructor-profile-uuid>', 2999, 'published');
