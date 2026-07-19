-- ============================================================
-- LearnSphere: Signup automation
-- When a new user signs up via Supabase Auth (email, Google, or OTP),
-- automatically create their profile row + wallet, and credit the
-- referrer if a referral code was passed in signup metadata.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  referrer_profile_id uuid;
  ref_code text;
begin
  -- Pull optional referral_code from the signup metadata (raw_user_meta_data)
  ref_code := new.raw_user_meta_data ->> 'referral_code';

  if ref_code is not null then
    select id into referrer_profile_id from public.profiles where referral_code = ref_code;
  end if;

  insert into public.profiles (id, full_name, avatar_url, phone, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.phone,
    referrer_profile_id
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
