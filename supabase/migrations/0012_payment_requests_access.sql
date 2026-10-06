-- Follow-up to 0011: make sure the API can reach payment_requests.
--
-- Supabase normally grants new public tables to the API roles automatically,
-- but projects with that default turned off answer every insert with
-- "permission denied". RLS still decides which rows each user may touch.
-- The final line makes the API pick up the new table without waiting.
--
-- Safe to run more than once.

grant select, insert, update on public.payment_requests to authenticated;
grant execute on function public.approve_payment_request(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
