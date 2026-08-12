alter table public.courses
  add column if not exists duration_label text,
  add column if not exists outcomes text[] not null default '{}';
