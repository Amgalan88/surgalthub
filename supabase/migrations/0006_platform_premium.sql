-- Карго Академи: platform-wide premium subscription (replaces per-course
-- pricing). Admin manually activates a user for 6 months after confirming
-- a bank transfer; premium unlocks every non-free-preview lesson site-wide.

alter table public.profiles
  add column if not exists premium_until timestamptz;

-- Capture phone at signup too (previously only set via profile edit).
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
  );
  return new;
end;
$$;
