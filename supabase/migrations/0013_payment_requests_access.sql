-- Payment requests: complete, self-contained setup.
--
-- Running this one file is enough, whether or not 0011 / 0012 ran before,
-- ran only partly, or came from an earlier version: every step checks what
-- already exists and only adds what is missing. Existing requests are kept.
--
-- It also grants the site's API role access to the table. Supabase projects
-- that do not grant new tables automatically otherwise answer every read and
-- write with "permission denied", so learners could not file a request and
-- the admin's Payments page stayed empty.
--
-- Safe to run more than once.

-- 1. Table and columns -------------------------------------------------------

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.payment_requests
  add column if not exists payer_name text,
  add column if not exists admin_note text;

alter table public.payment_requests
  drop constraint if exists payment_requests_payer_name_length;
alter table public.payment_requests
  add constraint payment_requests_payer_name_length
  check (char_length(payer_name) <= 120);

alter table public.payment_requests
  drop constraint if exists payment_requests_admin_note_length;
alter table public.payment_requests
  add constraint payment_requests_admin_note_length
  check (char_length(admin_note) <= 500);

-- One open request per learner, so pressing twice cannot grant Premium twice.
-- (An earlier version named this index without the _idx suffix.)
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname in ('payment_requests_one_pending_idx', 'payment_requests_one_pending')
  ) then
    create unique index payment_requests_one_pending_idx
      on public.payment_requests (user_id) where status = 'pending';
  end if;
end;
$$;

create index if not exists payment_requests_user_idx
  on public.payment_requests (user_id, created_at desc);
create index if not exists payment_requests_status_created_idx
  on public.payment_requests (status, created_at desc);

-- 2. Row-level security ------------------------------------------------------

alter table public.payment_requests enable row level security;

drop policy if exists "payment_requests: read own or admin" on public.payment_requests;
create policy "payment_requests: read own or admin"
  on public.payment_requests for select
  using (public.is_admin() or user_id = auth.uid());

-- Learners may only open a fresh, unreviewed request for themselves.
drop policy if exists "payment_requests: insert own pending" on public.payment_requests;
create policy "payment_requests: insert own pending"
  on public.payment_requests for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and admin_note is null
  );

-- ...and withdraw it while it is still open.
drop policy if exists "payment_requests: delete own pending" on public.payment_requests;
create policy "payment_requests: delete own pending"
  on public.payment_requests for delete
  using (user_id = auth.uid() and status = 'pending');

drop policy if exists "payment_requests: admin update" on public.payment_requests;
create policy "payment_requests: admin update"
  on public.payment_requests for update
  using (public.is_admin()) with check (public.is_admin());

-- 3. Approve = close the request and grant Premium, in one transaction -------
-- Renewing before expiry stacks on the remaining time. Returns false when the
-- request was no longer pending (another admin got there first), so Premium
-- is never extended twice for one payment. Dropped first because an earlier
-- version returned a different type, which "create or replace" cannot change.

drop function if exists public.approve_payment_request(uuid, integer);

create function public.approve_payment_request(
  request_id uuid,
  extend_months integer
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  target_user uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  update public.payment_requests
     set status = 'approved',
         reviewed_at = now(),
         reviewed_by = auth.uid()
   where id = request_id
     and status = 'pending'
  returning user_id into target_user;

  if target_user is null then
    return false;
  end if;

  update public.profiles
     set premium_until =
       greatest(now(), coalesce(premium_until, now()))
       + make_interval(months => extend_months)
   where id = target_user;

  return true;
end;
$$;

-- 4. API access --------------------------------------------------------------

revoke execute on function public.approve_payment_request(uuid, integer) from public, anon;
grant execute on function public.approve_payment_request(uuid, integer) to authenticated;
grant select, insert, update, delete on public.payment_requests to authenticated;

-- Make the API pick up the changes right away.
notify pgrst, 'reload schema';
