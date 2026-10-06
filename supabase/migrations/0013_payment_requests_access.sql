-- Let the site's API reach payment_requests.
--
-- Supabase normally grants new public tables to the API roles automatically,
-- but projects with that default turned off answer every read and write with
-- "permission denied" (42501): learners could not file a request and the
-- admin's Payments page stayed empty. RLS (0011, 0012) still decides which
-- rows each user may touch. The last line makes the API pick up the change
-- right away.
--
-- Safe to run more than once.

grant select, insert, update, delete on public.payment_requests to authenticated;
grant execute on function public.approve_payment_request(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
