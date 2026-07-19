-- ============================================================
-- LearnSphere: Commerce Schema
-- Orders, Payments, Coupons, Referrals, Wallet, Withdrawals
-- ============================================================

-- ── Coupons ──────────────────────────────────────────────
create table public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text not null check (discount_type in ('flat', 'percent')),
  discount_value numeric(10,2) not null,
  max_discount numeric(10,2),
  min_order_amount numeric(10,2) not null default 0,
  usage_limit int, -- null = unlimited
  used_count int not null default 0,
  applicable_course_ids uuid[], -- null = all courses
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Orders ───────────────────────────────────────────────
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  coupon_id uuid references public.coupons(id),
  base_amount numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  final_amount numeric(10,2) not null,
  currency text not null default 'INR',
  gateway payment_gateway not null,
  gateway_order_id text,
  gateway_payment_id text,
  status order_status not null default 'created',
  invoice_number text unique,
  invoice_url text,
  referral_code_used text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_gateway_order on public.orders(gateway_order_id);

alter table public.enrollments
  add constraint fk_enrollments_order foreign key (order_id) references public.orders(id);

-- ── Referral commission rules (admin-configurable) ──────
create table public.referral_rules (
  id uuid primary key default uuid_generate_v4(),
  commission_type text not null default 'percent' check (commission_type in ('flat', 'percent')),
  commission_value numeric(10,2) not null default 10, -- e.g. 10%
  min_payout_amount numeric(10,2) not null default 500,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Referral earnings ledger ─────────────────────────────
create table public.referral_earnings (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references public.profiles(id),
  referred_user_id uuid not null references public.profiles(id),
  order_id uuid not null references public.orders(id),
  commission_amount numeric(10,2) not null,
  status text not null default 'credited' check (status in ('credited', 'reversed')),
  created_at timestamptz not null default now()
);
create index idx_referral_earnings_referrer on public.referral_earnings(referrer_id);

-- ── Wallet ───────────────────────────────────────────────
create table public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id),
  balance numeric(10,2) not null default 0,
  total_earned numeric(10,2) not null default 0,
  total_withdrawn numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.wallets(id),
  amount numeric(10,2) not null, -- positive = credit, negative = debit
  type text not null check (type in ('referral_commission', 'withdrawal', 'refund_adjustment', 'admin_adjustment')),
  reference_id uuid, -- points to referral_earnings.id or withdrawal_requests.id
  description text,
  created_at timestamptz not null default now()
);
create index idx_wallet_tx_wallet on public.wallet_transactions(wallet_id);

-- ── Bank / UPI details for payouts ───────────────────────
create table public.payout_methods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  method_type text not null check (method_type in ('bank', 'upi')),
  account_holder_name text,
  account_number text,
  ifsc_code text,
  upi_id text,
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Withdraw requests ────────────────────────────────────
create table public.withdrawal_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  amount numeric(10,2) not null,
  payout_method_id uuid references public.payout_methods(id),
  status withdraw_status not null default 'pending',
  admin_note text,
  processed_by uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);
create index idx_withdrawals_user on public.withdrawal_requests(user_id);
create index idx_withdrawals_status on public.withdrawal_requests(status);

-- ── Site settings (single-row config table for admin panel) ─
create table public.site_settings (
  id int primary key default 1,
  site_name text not null default 'LearnSphere',
  logo_url text,
  favicon_url text,
  primary_color text default '#6d5efc',
  support_email text,
  support_phone text,
  social_links jsonb default '{}',
  maintenance_mode boolean not null default false,
  default_language text not null default 'en',
  constraint single_row check (id = 1)
);
insert into public.site_settings (id) values (1);

-- ── Banners (homepage/promo management) ──────────────────
create table public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  image_url text not null,
  link_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
