import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessLesson } from "@/lib/access";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CourseWithMeta } from "@/lib/data/courses";
import type { Profile } from "@/lib/types";
import { courseNumber, lessonHref, primaryCourseAction } from "./courseLinks";

const PREVIEW_LESSONS = 6;

/** One course as a syllabus entry: cover, summary, and its first lessons. */
export function CourseRow({
  course,
  index,
  profile,
}: {
  course: CourseWithMeta;
  index: number;
  profile: Profile | null;
}) {
  const completedIds = new Set(course.completedLessonIds);
  const action = primaryCourseAction(course.slug, course.lessons, completedIds, profile);
  const preview = course.lessons.slice(0, PREVIEW_LESSONS);
  const hidden = course.lessonCount - preview.length;
  const progressPct =
    course.lessonCount > 0
      ? Math.round((course.completedLessons / course.lessonCount) * 100)
      : 0;
  const coursePath = `/courses/${course.slug}`;

  return (
    <article className="grid gap-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-8">
      <Link
        href={action.href}
        className="group relative block aspect-video overflow-hidden rounded-lg bg-navy-900"
        aria-label={`${course.title} — ${action.label}`}
      >
        {course.cover_image ? (
          <Image
            src={course.cover_image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="absolute inset-0 flex items-end p-4 text-5xl font-semibold text-gold-300/90">
            {courseNumber(index)}
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-3 text-xs font-medium text-navy-900 shadow-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
            <Play size={10} fill="currentColor" />
          </span>
          {action.label}
        </span>
      </Link>

      <div className="flex min-w-0 flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          Курс {courseNumber(index)}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold leading-snug text-navy-900">
          <Link href={coursePath} className="hover:text-brand-700">
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          {course.description}
        </p>

        <p className="mt-3 flex flex-wrap gap-x-2 text-sm text-slate-500">
          <span>{course.lessonCount} хичээл</span>
          {course.duration_label && (
            <>
              <span aria-hidden>·</span>
              <span>{course.duration_label}</span>
            </>
          )}
          {course.freeLessonCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="text-emerald-700">
                {course.freeLessonCount} нь үнэгүй
              </span>
            </>
          )}
        </p>

        {course.completedLessons > 0 && (
          <div className="mt-4 max-w-sm">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Таны явц</span>
              <span>
                {course.completedLessons}/{course.lessonCount}
              </span>
            </div>
            <ProgressBar value={progressPct} className="mt-1.5" />
          </div>
        )}

        {preview.length > 0 && (
          <ol className="mt-5 grid grid-cols-1 gap-x-6 gap-y-1 border-t border-slate-100 pt-4 sm:grid-cols-2">
            {preview.map((lesson, i) => {
              const open = canAccessLesson(lesson, profile, completedIds.has(lesson.id));
              const done = completedIds.has(lesson.id);
              const row = (
                <>
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">
                    {i + 1}
                  </span>
                  <span className={cn("min-w-0 flex-1 truncate", open ? "text-navy-900" : "text-slate-500")}>
                    {lesson.title}
                  </span>
                  {done ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" aria-label="Үзсэн" />
                  ) : lesson.is_free_preview ? (
                    <span className="shrink-0 text-xs font-medium text-emerald-700">Үнэгүй</span>
                  ) : !open ? (
                    <Lock size={13} className="shrink-0 text-slate-400" aria-label="Premium" />
                  ) : null}
                </>
              );
              return (
                <li key={lesson.id} className="min-w-0">
                  {open ? (
                    <Link
                      href={lessonHref(course.slug, lesson.id)}
                      className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="-mx-2 flex items-center gap-2.5 px-2 py-1.5 text-sm">{row}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
          <Link
            href={coursePath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            {hidden > 0 ? `Бүх ${course.lessonCount} хичээлийг харах` : "Курсын дэлгэрэнгүй"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
