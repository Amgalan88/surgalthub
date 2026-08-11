-- Карго Академи: extra media fields for lessons (cover image, audio, slides).
-- video_url already existed (YouTube link or an uploaded video file URL).

alter table public.lessons
  add column if not exists cover_image_url text,
  add column if not exists audio_url text,
  add column if not exists slides_url text;
