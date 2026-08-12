-- Enforce the Premium paywall in the database, not only in the app layer.
--
-- Previously any caller holding the (public by design) anon key could read
-- every lesson row of a published course, content_md included, bypassing
-- payment entirely. The gate now lives in RLS.
--
-- Lesson *titles* must stay visible to everyone so the course roadmap can
-- advertise what is still locked, so safe metadata moves to a view while the
-- lessons table itself only ever hands out rows the caller may actually read.

create or replace function public.has_active_premium()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and premium_until is not null
      and premium_until > now()
  );
$$;

drop policy if exists "lessons: read when course published or admin" on public.lessons;

create policy "lessons: read accessible content" on public.lessons
  for select using (
    public.is_admin()
    or (
      exists (
        select 1 from public.courses c
        where c.id = lessons.course_id and c.published = true
      )
      and (
        lessons.is_free_preview
        or public.has_active_premium()
        -- Anything already completed stays open after Premium lapses.
        or exists (
          select 1 from public.lesson_progress lp
          where lp.lesson_id = lessons.id and lp.user_id = auth.uid()
        )
      )
    )
  );

-- Safe, contentless lesson metadata for roadmaps, sidebars and counts.
-- Intentionally not security_invoker: it must show locked lessons, so it
-- bypasses the policy above and is limited to non-sensitive columns instead.
create or replace view public.lesson_outline as
  select
    l.id,
    l.course_id,
    l.title,
    l.order_index,
    l.is_free_preview
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where c.published = true;

grant select on public.lesson_outline to anon, authenticated;
