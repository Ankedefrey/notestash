-- ============================================================
-- NoteStash — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS (extends Supabase auth.users) ──────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         text not null default 'student' check (role in ('student', 'admin')),
  created_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = any(string_to_array(current_setting('app.admin_emails', true), ','))
         then 'admin' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── MODULES ──────────────────────────────────────────────────────────────────
create table public.modules (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,           -- e.g. "STK110"
  name        text not null,
  description text,
  price_zar   integer not null default 149,   -- in Rands
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── PDFS ─────────────────────────────────────────────────────────────────────
create table public.pdfs (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  storage_path text not null,                 -- path inside Supabase storage bucket
  file_size   bigint,
  page_count  integer,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  uploaded_at timestamptz not null default now()
);

-- ─── ENTITLEMENTS ─────────────────────────────────────────────────────────────
create table public.entitlements (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  module_id   uuid not null references public.modules(id) on delete cascade,
  granted_at  timestamptz not null default now(),
  expires_at  timestamptz,                    -- null = never expires
  unique(user_id, module_id)
);

-- ─── ACCESS CODES ─────────────────────────────────────────────────────────────
create table public.access_codes (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,          -- e.g. "UNLK-A7X2-9QP1"
  module_id     uuid not null references public.modules(id) on delete cascade,
  max_uses      integer not null default 1,
  use_count     integer not null default 0,
  expires_at    timestamptz,                   -- null = no expiry
  created_at    timestamptz not null default now(),
  redeemed_by   uuid references public.profiles(id),
  redeemed_at   timestamptz,
  created_by    uuid references public.profiles(id),
  status        text not null default 'active' check (status in ('active', 'redeemed', 'expired', 'revoked'))
);

-- ─── PAYMENTS ─────────────────────────────────────────────────────────────────
create table public.payments (
  id          uuid primary key default uuid_generate_v4(),
  payer_name  text not null,
  reference   text not null,
  module_id   uuid not null references public.modules(id),
  amount_zar  integer not null,
  date_paid   date not null,
  code_id     uuid references public.access_codes(id),
  notes       text,
  logged_by   uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- ─── SESSIONS ─────────────────────────────────────────────────────────────────
create table public.sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  token_hash        text not null unique,      -- hashed session token
  created_at        timestamptz not null default now(),
  last_seen         timestamptz not null default now(),
  revoked_at        timestamptz,
  ip_hash           text,
  device_info       text,                      -- browser/OS fingerprint
  is_active         boolean generated always as (revoked_at is null) stored
);

-- ─── ACTIVITY LOGS (suspicious login tracker) ────────────────────────────────
create table public.activity_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id),
  event       text not null,                  -- e.g. 'session_kicked', 'code_redeemed'
  metadata    jsonb,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.modules        enable row level security;
alter table public.pdfs           enable row level security;
alter table public.entitlements   enable row level security;
alter table public.access_codes   enable row level security;
alter table public.payments       enable row level security;
alter table public.sessions       enable row level security;
alter table public.activity_logs  enable row level security;

-- Profiles: users can read their own
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Admins read all profiles"
  on public.profiles for select using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Modules: everyone can read active modules
create policy "Anyone reads active modules"
  on public.modules for select using (active = true);
create policy "Admins manage modules"
  on public.modules for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- PDFs: only users with valid entitlement can see metadata
create policy "Entitled users read PDFs"
  on public.pdfs for select using (
    exists(
      select 1 from public.entitlements e
      where e.user_id = auth.uid()
        and e.module_id = pdfs.module_id
        and (e.expires_at is null or e.expires_at > now())
    )
    or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins manage PDFs"
  on public.pdfs for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Entitlements: users see their own
create policy "Users read own entitlements"
  on public.entitlements for select using (user_id = auth.uid());
create policy "Admins manage entitlements"
  on public.entitlements for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Access codes: only admins
create policy "Admins manage access_codes"
  on public.access_codes for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Payments: only admins
create policy "Admins manage payments"
  on public.payments for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Sessions: users manage their own
create policy "Users manage own sessions"
  on public.sessions for all using (user_id = auth.uid());
create policy "Admins read all sessions"
  on public.sessions for select using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Activity logs: admins only
create policy "Admins read activity"
  on public.activity_logs for select using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create private PDF storage bucket (run in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- ============================================================
-- SEED DATA — STK110
-- ============================================================

insert into public.modules (code, name, description, price_zar) values
  ('STK110', 'Introductory Statistics', 'Probability, distributions, hypothesis testing & regression.', 149),
  ('STK120', 'Applied Statistics', 'Time series, ANOVA, and non-parametric methods.', 149),
  ('WST212', 'Mathematical Statistics', 'Advanced statistical theory and inference.', 149);
