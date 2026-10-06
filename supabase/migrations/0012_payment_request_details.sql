-- Details for payment requests (builds on 0011):
--   * payer_name — the name on the bank account the money came from, when a
--     learner paid from someone else's account, so the admin can match it.
--   * admin_note — why a request was turned down; the learner sees it on
--     /premium and can fix the transfer and try again.
--   * learners may withdraw their own request while it is still pending.
--
-- Safe to run more than once. The site keeps working without it; these
-- extras simply stay hidden until it has been run.

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

-- Learners must not write a note pretending to come from the admin.
drop policy if exists "payment_requests: insert own pending" on public.payment_requests;
create policy "payment_requests: insert own pending"
  on public.payment_requests for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and admin_note is null
  );

drop policy if exists "payment_requests: delete own pending" on public.payment_requests;
create policy "payment_requests: delete own pending"
  on public.payment_requests for delete
  using (user_id = auth.uid() and status = 'pending');

-- The admin's Payments page lists by status, oldest first.
create index if not exists payment_requests_status_created_idx
  on public.payment_requests (status, created_at desc);
