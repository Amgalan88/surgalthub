-- Карго Академи: lightweight paywall (no payment gateway yet).
-- Admins mark a course's price for display, mark individual lessons as
-- free previews, and manually grant paid access per enrollment (e.g.
-- after confirming a bank transfer / QPay payment outside the app).

alter table public.courses
  add column if not exists price integer not null default 0; -- MNT, 0 = fully free course

alter table public.lessons
  add column if not exists is_free_preview boolean not null default false;

alter table public.enrollments
  add column if not exists has_paid boolean not null default false;
