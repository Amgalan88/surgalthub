import manifest from "@/scripts/hicheel.json";
import type { CourseTrack } from "@/lib/types";

export interface ImportLesson {
  title: string;
  /** Sub-folder inside the chosen lesson folder; "" for its top level. */
  folder: string;
  /** Text the video's file name must contain. */
  match: string;
}

export interface ImportCourse {
  slug: string;
  title: string;
  track: CourseTrack;
  description: string;
  outcomes: string[];
  freeLessons: number;
  lessons: ImportLesson[];
}

/** scripts/hicheel.json — the same plan the command-line importer follows. */
export const IMPORT_PLAN = manifest as {
  demoCourseSlugs: string[];
  courses: ImportCourse[];
};

export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm", ".mkv"];
/** Cloudinary refuses single-request video uploads above this on the free plan. */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const PREFERRED_PREFIX = "audo_enhanced";

/** Case, Unicode form and dash style differ between how names are typed and stored. */
export function normalizeName(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/[‐-―]/g, "-");
}

/**
 * Picks the one video in `names` that matches. Each video exists both raw and
 * with cleaned-up audio, so the cleaned one wins when both match.
 */
export function pickVideo(
  names: string[],
  match: string
): { name: string } | { error: string } {
  const needle = normalizeName(match);
  const candidates = names.filter((name) => {
    const lower = normalizeName(name);
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext)) && lower.includes(needle);
  });
  const preferred = candidates.filter((n) => normalizeName(n).startsWith(PREFERRED_PREFIX));
  const picked = preferred.length > 0 ? preferred : candidates;

  if (picked.length === 0) return { error: `"${match}" нэртэй видео олдсонгүй` };
  if (picked.length > 1) return { error: `"${match}" нэртэй ${picked.length} видео байна` };
  return { name: picked[0] };
}

/** First frame a few seconds in, as a JPEG — Cloudinary renders it on request. */
export function posterFromVideo(url: string) {
  return url
    .replace("/video/upload/", "/video/upload/so_3,w_1280,h_720,c_fill/")
    .replace(/\.[a-z0-9]+$/i, ".jpg");
}

export function formatVideoDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} минут видео`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} цаг ${rest} минут видео` : `${hours} цаг видео`;
}
