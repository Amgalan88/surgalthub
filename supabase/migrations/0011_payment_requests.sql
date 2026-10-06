-- "I've paid" notifications.
--
-- A learner who has transferred the Premium fee presses a button on /premium,
-- which files a pending request here. Admins see every pending request as a
-- banner across the admin panel and either approve it (Premium is granted in
-- the same transaction) or reject it (the money never arrived).
--
-- Safe to run more than once.

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- One open request per learner: pressing the button twice must not make the
-- admin approve (and extend Premium) twice.
create unique index if not exists payment_requests_one_pending_idx
  on public.payment_requests (user_id) where status = 'pending';

create index if not exists payment_requests_user_idx
  on public.payment_requests (user_id, created_at desc);

alter table public.payment_requests enable row level security;

drop policy if exists "payment_requests: read own or admin" on public.payment_requests;
create policy "payment_requests: read own or admin"
  on public.payment_requests for select
  using (public.is_admin() or user_id = auth.uid());

-- Learners can only open a fresh, unreviewed request for themselves.
drop policy if exists "payment_requests: insert own pending" on public.payment_requests;
create policy "payment_requests: insert own pending"
  on public.payment_requests for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

drop policy if exists "payment_requests: admin update" on public.payment_requests;
create policy "payment_requests: admin update"
  on public.payment_requests for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Approve = close the request and grant Premium, atomically. Renewing before
-- expiry stacks on the remaining time, same as the manual button on
-- /admin/users. Returns false when the request was no longer pending (another
-- admin got there first), so Premium is never extended twice for one payment.
-- ---------------------------------------------------------------------------

create or replace function public.approve_payment_request(
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

revoke execute on function public.approve_payment_request(uuid, integer) from public, anon;
grant execute on function public.approve_payment_request(uuid, integer) to authenticated;
