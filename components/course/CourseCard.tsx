import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Rocket,
  Settings,
  Globe,
  Clock,
  BookOpen,
  Crown,
  Sparkles,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CourseWithMeta } from "@/lib/data/courses";
import { TRACK_LABELS, type CourseTrack } from "@/lib/types";

const trackConfig: Record<
  CourseTrack,
  { icon: typeof Rocket; gradFrom: string; gradTo: string }
> = {
  opening: { icon: Rocket, gradFrom: "#172554", gradTo: "#1d4ed8" },
  operating: { icon: Settings, gradFrom: "#172554", gradTo: "#0f766e" },
  platform: { icon: Globe, gradFrom: "#172554", gradTo: "#b45309" },
};

export function CourseCard({ course }: { course: CourseWithMeta }) {
  const cfg = trackConfig[course.track];
  const Icon = cfg.icon;
  const progressPct =
    course.lessonCount > 0
      ? Math.round((course.completedLessons / course.lessonCount) * 100)
      : 0;
  const started = course.enrolled && course.completedLessons > 0;
  const finished = course.lessonCount > 0 && progressPct === 100;

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-slate-300 group-hover:shadow-[0_16px_40px_-12px_rgba(23,37,84,0.25)]">
        {/* Cover: the admin-uploaded image when there is one, otherwise a
            track-coloured fallback so every card still reads as intentional. */}
        <div
          className="relative flex h-44 items-center justify-center overflow-hidden"
          style={
            course.cover_image
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${cfg.gradFrom} 0%, ${cfg.gradTo} 100%)`,
                }
          }
        >
          {course.cover_image ? (
            <>
              <Image
                src={course.cover_image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/15 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(245,158,11,0.28),transparent_55%)]" />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full border border-white/5 transition-transform duration-500 group-hover:scale-125" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-300 ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon size={30} strokeWidth={1.75} />
              </span>
            </>
          )}

          <span className="absolute bottom-3 right-4 text-[11px] font-medium tracking-wide text-white/70">
            {TRACK_LABELS[course.track]}
          </span>

          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {course.freeLessonCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                <Sparkles size={11} /> {course.freeLessonCount} хичээл үнэгүй
              </span>
            )}
            {course.hasPremiumLessons && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-brand-200 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <Crown size={11} /> Premium
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold leading-snug text-navy-900 transition-colors duration-200 group-hover:text-brand-700">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
            {course.description}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-slate-400" />
              {course.lessonCount} хичээл
            </span>
            {course.duration_label && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                {course.duration_label}
              </span>
            )}
          </div>

          {course.enrolled && course.lessonCount > 0 && (
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                  {finished ? "Дууссан" : "Таны явц"}
                </span>
                <span className="text-slate-500">
                  {course.completedLessons}/{course.lessonCount}
                </span>
              </div>
              <ProgressBar value={progressPct} className="mt-1.5" />
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              {finished
                ? "Дахин үзэх"
                : started
                  ? "Үргэлжлүүлэх"
                  : course.enrolled
                    ? "Эхлэх"
                    : "Дэлгэрэнгүй"}
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
