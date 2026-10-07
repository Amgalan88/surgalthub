-- Promo codes: the admin creates single-use codes (e.g. five for a partner
-- company), and a learner who types one on /premium gets Premium at once,
-- with no payment to check. A code works for one account only.
--
-- Safe to run more than once.

-- 1. Codes -------------------------------------------------------------------

create table if not exists public.promo_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{6,40}$'),
  -- Who the code was made for, e.g. "ABC компани"; only admins see it.
  note text check (char_length(note) <= 120),
  months integer not null default 6 check (months between 1 and 24),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  redeemed_by uuid references public.profiles (id) on delete set null,
  redeemed_at timestamptz,
  revoked_at timestamptz
);

create index if not exists promo_codes_created_idx
  on public.promo_codes (created_at desc);

alter table public.promo_codes enable row level security;

-- Only admins can list, create or revoke codes. Learners never read this
-- table; they redeem through redeem_promo_code() below.
drop policy if exists "promo_codes: admin all" on public.promo_codes;
create policy "promo_codes: admin all" on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.promo_codes to authenticated;

-- 2. Let the redeem function (and only it) extend a learner's Premium ---------
-- protect_profile_privileges (0010) stops learners from changing their own
-- premium_until. redeem_promo_code() sets a transaction-local flag first; API
-- requests cannot set it, since each one is a single statement.

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and coalesce(current_setting('cargohub.promo_grant', true), '') = 'on' then
    -- Only Premium may change here; everything else stays as it was.
    new.role := old.role;
    new.id := old.id;
    new.created_at := old.created_at;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'user';
    new.premium_until := null;
  else
    new.role := old.role;
    new.premium_until := old.premium_until;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before insert or update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

-- 3. Redeem ------------------------------------------------------------------
-- Claims the code for the caller and extends Premium in one transaction
-- (stacking on time already left). Errors:
--   PROMO_LOGIN   not signed in
--   PROMO_INVALID no such code, or it was revoked
--   PROMO_USED    someone has already used it

create or replace function public.redeem_promo_code(input_code text)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  clean text := upper(regexp_replace(coalesce(input_code, ''), '\s', '', 'g'));
  grant_months integer;
  new_until timestamptz;
begin
  if me is null then
    raise exception 'PROMO_LOGIN';
  end if;

  -- The claim below references the caller's profiles row, which accounts made
  -- without the signup trigger may lack; create it first.
  insert into public.profiles (id) values (me) on conflict (id) do nothing;

  update public.promo_codes
     set redeemed_by = me, redeemed_at = now()
   where code = clean
     and redeemed_by is null
     and revoked_at is null
  returning months into grant_months;

  if grant_months is null then
    if exists (
      select 1 from public.promo_codes
      where code = clean and redeemed_at is not null and revoked_at is null
    ) then
      raise exception 'PROMO_USED';
    end if;
    raise exception 'PROMO_INVALID';
  end if;

  perform set_config('cargohub.promo_grant', 'on', true);
  update public.profiles
     set premium_until = greatest(now(), coalesce(premium_until, now()))
       + make_interval(months => grant_months)
   where id = me
  returning premium_until into new_until;
  perform set_config('cargohub.promo_grant', '', true);

  return new_until;
end;
$$;

revoke execute on function public.redeem_promo_code(text) from public, anon;
grant execute on function public.redeem_promo_code(text) to authenticated;

notify pgrst, 'reload schema';
