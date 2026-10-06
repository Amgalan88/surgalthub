-- Lets the admin panel show each user's email, avatar and last sign-in.
--
-- Those live in auth.users, which the site can only read with the secret
-- service-role key. This function hands them to signed-in admins only, so the
-- Users page works without that key being set on the hosting side.
--
-- Safe to run more than once.

create or replace function public.admin_user_directory()
returns table (
  id uuid,
  email text,
  avatar text,
  last_sign_in_at timestamptz
)
language plpgsql
security definer set search_path = public, auth
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  return query
    select u.id,
           u.email::text,
           (u.raw_user_meta_data ->> 'avatar')::text,
           u.last_sign_in_at
    from auth.users u;
end;
$$;

revoke execute on function public.admin_user_directory() from public, anon;
grant execute on function public.admin_user_directory() to authenticated;

notify pgrst, 'reload schema';
