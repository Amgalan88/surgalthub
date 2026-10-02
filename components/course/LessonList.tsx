import Link from "next/link";
import { CheckCircle2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessLesson } from "@/lib/access";
import type { LessonOutline, Profile } from "@/lib/types";
import { lessonHref } from "./courseLinks";

/**
 * Every lesson of a course as a numbered list. Open lessons link straight to
 * the player; Premium ones send the viewer to the page that explains paying.
 */
export function LessonList({
  courseSlug,
  lessons,
  completedIds,
  profile,
  currentLessonId,
  compact = false,
}: {
  courseSlug: string;
  lessons: LessonOutline[];
  completedIds: ReadonlySet<string>;
  profile: Profile | null;
  /** Highlighted row: the lesson being watched, or the one to watch next. */
  currentLessonId?: string;
  /** Tighter rows for the lesson player's sidebar. */
  compact?: boolean;
}) {
  return (
    <ol className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", !compact && "divide-y divide-slate-100")}>
      {lessons.map((lesson, i) => {
        const done = completedIds.has(lesson.id);
        const open = canAccessLesson(lesson, profile, done);
        const current = lesson.id === currentLessonId;

        return (
          <li key={lesson.id}>
            <Link
              href={open ? lessonHref(courseSlug, lesson.id) : "/premium"}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 transition-colors",
                compact ? "px-3 py-2.5 text-sm" : "px-4 py-3.5 text-[15px] sm:px-5",
                current ? "bg-brand-50" : "hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                  compact ? "h-6 w-6" : "h-7 w-7",
                  done
                    ? "bg-emerald-50 text-emerald-700"
                    : current
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500"
                )}
              >
                {done ? <CheckCircle2 size={compact ? 14 : 15} /> : i + 1}
              </span>

              <span
                className={cn(
                  "min-w-0 flex-1",
                  compact ? "line-clamp-2" : "truncate",
                  open ? "text-navy-900" : "text-slate-500",
                  current && "font-medium"
                )}
              >
                {lesson.title}
              </span>

              {!done && lesson.is_free_preview && !compact && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Үнэгүй
                </span>
              )}
              {open ? (
                !compact && <Play size={15} className="shrink-0 text-slate-400" />
              ) : (
                <Lock size={14} className="shrink-0 text-slate-400" aria-label="Premium" />
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
