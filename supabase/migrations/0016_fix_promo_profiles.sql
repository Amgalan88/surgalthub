-- Fixes "Промо код идэвхжүүлж чадсангүй (23503)" and makes sure every user
-- has a profiles row.
--
-- 23503 meant the promo code was being linked to the learner's profiles row
-- before that row existed. Some accounts have no profiles row (made while the
-- signup trigger was missing), which also hides them from the admin's Users
-- page and breaks payment requests. This file:
--   1. creates the missing profiles rows for existing accounts,
--   2. (re)installs the signup trigger so new accounts always get one,
--   3. replaces redeem_promo_code() with the corrected order.
--
-- Safe to run more than once. Nothing existing is overwritten.

-- 1. Backfill ----------------------------------------------------------------

insert into public.profiles (id, full_name, phone, role)
select u.id,
       u.raw_user_meta_data ->> 'full_name',
       u.raw_user_meta_data ->> 'phone',
       'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 2. Signup trigger ----------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Redeem, with the profiles row created before the code is claimed --------

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
