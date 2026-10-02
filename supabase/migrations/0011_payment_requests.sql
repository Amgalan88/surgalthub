-- Payment requests: the learner presses "I have paid" after a bank transfer,
-- and the admin approves or rejects it from one list instead of hunting for
-- the user and extending Premium by hand.
--
-- Safe to run more than once.

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null check (amount > 0),
  -- Name on the bank account the money came from, when it is not the learner's.
  payer_name text check (char_length(payer_name) <= 120),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text check (char_length(admin_note) <= 500),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- One open request per learner; a second press just finds the first.
create unique index if not exists payment_requests_one_pending
  on public.payment_requests (user_id) where status = 'pending';

create index if not exists payment_requests_status_created
  on public.payment_requests (status, created_at desc);

alter table public.payment_requests enable row level security;

drop policy if exists "payment_requests: read own or admin" on public.payment_requests;
create policy "payment_requests: read own or admin" on public.payment_requests
  for select using (user_id = auth.uid() or public.is_admin());

-- Learners may only open a fresh, unreviewed request for themselves.
drop policy if exists "payment_requests: insert own pending" on public.payment_requests;
create policy "payment_requests: insert own pending" on public.payment_requests
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and admin_note is null
    and reviewed_by is null
    and reviewed_at is null
  );

-- ...and withdraw it while it is still open.
drop policy if exists "payment_requests: delete own pending" on public.payment_requests;
create policy "payment_requests: delete own pending" on public.payment_requests
  for delete using (user_id = auth.uid() and status = 'pending');

drop policy if exists "payment_requests: admin update" on public.payment_requests;
create policy "payment_requests: admin update" on public.payment_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- Approving extends Premium and closes the request in one transaction, so a
-- double click can never grant the months twice. Renewing before expiry
-- stacks on the time that is left.
create or replace function public.approve_payment_request(
  request_id uuid,
  months integer
)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  req public.payment_requests%rowtype;
  new_until timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Зөвшөөрөгдөөгүй үйлдэл.';
  end if;

  select * into req from public.payment_requests
  where id = request_id
  for update;

  if not found or req.status <> 'pending' then
    raise exception 'Энэ хүсэлт аль хэдийн шийдвэрлэгдсэн байна.';
  end if;

  update public.profiles
  set premium_until = greatest(coalesce(premium_until, now()), now())
    + make_interval(months => months)
  where id = req.user_id
  returning premium_until into new_until;

  update public.payment_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = request_id;

  return new_until;
end;
$$;

revoke all on function public.approve_payment_request(uuid, integer) from public, anon;
grant execute on function public.approve_payment_request(uuid, integer) to authenticated;
