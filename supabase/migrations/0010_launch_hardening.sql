-- Launch hardening: close privilege-escalation and paywall holes that are
-- reachable with nothing more than the public anon key, and expose honest
-- aggregate numbers for the landing page.
--
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1. Users must not be able to grant themselves admin or Premium.
--
-- "profiles: update own or admin" lets a signed-in user update their own row
-- with no column restriction, so a single REST call from the browser could
-- set role = 'admin' or premium_until = '2099-01-01'. RLS cannot restrict
-- columns, so a trigger pins the privileged ones for non-admin callers.
--
-- Callers with no end-user JWT (the SQL editor, the service-role key) are left
-- alone, which keeps the README's "make yourself admin" query working.
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
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

-- ---------------------------------------------------------------------------
-- 2. Progress rows must not unlock content.
--
-- The lessons policy keeps already-completed lessons readable after Premium
-- lapses. Because learners insert their own lesson_progress rows, anyone could
-- insert a row for every Premium lesson and then read all of them for free.
-- Completing a lesson now requires being able to open it in the first place.
-- ---------------------------------------------------------------------------

create or replace function public.can_open_lesson(target_lesson_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = target_lesson_id
      and (
        public.is_admin()
        or (
          c.published
          and (l.is_free_preview or public.has_active_premium())
        )
      )
  );
$$;

drop policy if exists "lesson_progress: own insert" on public.lesson_progress;
create policy "lesson_progress: own insert" on public.lesson_progress
  for insert with check (
    user_id = auth.uid() and public.can_open_lesson(lesson_id)
  );

-- Same rule for questions: you can only ask about a lesson you can see.
drop policy if exists "lesson_questions: insert own" on public.lesson_questions;
create policy "lesson_questions: insert own"
  on public.lesson_questions for insert with check (
    user_id = auth.uid()
    and answer is null
    and answered_at is null
    and answered_by is null
    and (
      public.can_open_lesson(lesson_id)
      or exists (
        select 1 from public.lesson_progress lp
        where lp.lesson_id = lesson_questions.lesson_id
          and lp.user_id = auth.uid()
      )
    )
  );

alter table public.lesson_questions
  drop constraint if exists lesson_questions_body_length;
alter table public.lesson_questions
  add constraint lesson_questions_body_length
  check (char_length(body) between 1 and 1000) not valid;

-- Enrollments: learners may only stamp their own completion, never the legacy
-- has_paid flag (kept for history, unused since platform-wide Premium).
create or replace function public.protect_enrollment_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.has_paid := false;
  else
    new.has_paid := old.has_paid;
    new.user_id := old.user_id;
    new.course_id := old.course_id;
    new.enrolled_at := old.enrolled_at;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_enrollment_fields on public.enrollments;
create trigger protect_enrollment_fields
  before insert or update on public.enrollments
  for each row execute procedure public.protect_enrollment_fields();

-- ---------------------------------------------------------------------------
-- 3. Landing-page numbers.
--
-- Enrollment and progress rows are private per user, so counting them through
-- the visitor's own RLS view always returned that visitor's rows only (zero
-- for anonymous visitors) and the stats bar never appeared. This returns only
-- the three totals, nothing identifying.
-- ---------------------------------------------------------------------------

create or replace function public.platform_stats()
returns table (learners bigint, lessons_completed bigint, courses bigint)
language sql
security definer set search_path = public
stable
as $$
  select
    (select count(distinct user_id) from public.enrollments),
    (select count(*) from public.lesson_progress),
    (select count(*) from public.courses where published);
$$;

grant execute on function public.platform_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Indexes for the queries every page makes.
-- ---------------------------------------------------------------------------

create index if not exists lessons_course_order_idx
  on public.lessons (course_id, order_index);
create index if not exists enrollments_course_idx
  on public.enrollments (course_id);
create index if not exists lesson_progress_lesson_idx
  on public.lesson_progress (lesson_id);
create index if not exists courses_published_created_idx
  on public.courses (published, created_at desc);
