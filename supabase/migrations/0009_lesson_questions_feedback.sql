-- Per-lesson Q&A and a lightweight "was this clear?" signal.
--
-- Questions are answered by admins only; learners do not reply to each other
-- yet, so there is no thread table. Answered questions are readable by anyone
-- who can see the course, which is what stops the same question recurring.

create table if not exists public.lesson_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  answer text,
  answered_at timestamptz,
  answered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_questions_lesson_idx
  on public.lesson_questions (lesson_id, created_at desc);

-- Unanswered questions surface first in the admin queue.
create index if not exists lesson_questions_pending_idx
  on public.lesson_questions (created_at) where answer is null;

alter table public.lesson_questions enable row level security;

create policy "lesson_questions: read answered or own or admin"
  on public.lesson_questions for select using (
    public.is_admin()
    or user_id = auth.uid()
    or answer is not null
  );

create policy "lesson_questions: insert own"
  on public.lesson_questions for insert with check (user_id = auth.uid());

-- Only admins answer, and only the answer fields are theirs to change.
create policy "lesson_questions: admin update"
  on public.lesson_questions for update
  using (public.is_admin()) with check (public.is_admin());

create policy "lesson_questions: delete own or admin"
  on public.lesson_questions for delete
  using (public.is_admin() or user_id = auth.uid());

-- ---------------------------------------------------------------------------

create table if not exists public.lesson_feedback (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  helpful boolean not null,
  created_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

alter table public.lesson_feedback enable row level security;

create policy "lesson_feedback: read own or admin"
  on public.lesson_feedback for select
  using (public.is_admin() or user_id = auth.uid());

create policy "lesson_feedback: insert own"
  on public.lesson_feedback for insert with check (user_id = auth.uid());

create policy "lesson_feedback: update own"
  on public.lesson_feedback for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
