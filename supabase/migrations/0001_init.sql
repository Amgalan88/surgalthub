-- Карго Академи: initial schema, RLS policies, and signup trigger
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  track text not null check (track in ('opening', 'operating', 'platform')),
  cover_image text,
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  content_md text not null default '',
  video_url text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index int not null,
  order_index int not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  score int not null,
  passed boolean not null,
  attempted_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------------------------------------------------------------------------
-- Signup trigger: auto-create a profile row for every new auth user
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());
create policy "profiles: admin insert" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

-- courses
create policy "courses: public read published" on public.courses
  for select using (published = true or public.is_admin());
create policy "courses: admin write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- lessons
create policy "lessons: read when course published or admin" on public.lessons
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.published = true
    )
  );
create policy "lessons: admin write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- enrollments
create policy "enrollments: own read" on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments: own insert" on public.enrollments
  for insert with check (user_id = auth.uid());
create policy "enrollments: own update" on public.enrollments
  for update using (user_id = auth.uid() or public.is_admin());

-- lesson_progress
create policy "lesson_progress: own read" on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_admin());
create policy "lesson_progress: own insert" on public.lesson_progress
  for insert with check (user_id = auth.uid());
create policy "lesson_progress: own delete" on public.lesson_progress
  for delete using (user_id = auth.uid());

-- quiz_questions (options/answers hidden from non-admins at the app layer;
-- readable by enrolled users so the quiz can be rendered)
create policy "quiz_questions: read when enrolled or admin" on public.quiz_questions
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.course_id = quiz_questions.course_id and e.user_id = auth.uid()
    )
  );
create policy "quiz_questions: admin write" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- quiz_attempts
create policy "quiz_attempts: own read" on public.quiz_attempts
  for select using (user_id = auth.uid() or public.is_admin());
create policy "quiz_attempts: own insert" on public.quiz_attempts
  for insert with check (user_id = auth.uid());

-- certificates
create policy "certificates: own read" on public.certificates
  for select using (user_id = auth.uid() or public.is_admin());
create policy "certificates: own insert" on public.certificates
  for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Promote yourself to admin after signing up once, e.g.:
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';
-- ---------------------------------------------------------------------------
