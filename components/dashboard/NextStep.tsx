import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Lock, PartyPopper, Play } from "lucide-react";
import { canAccessLesson } from "@/lib/access";
import { courseNumber, lessonHref } from "@/components/course/courseLinks";
import type { CourseWithMeta } from "@/lib/data/courses";
import type { LessonOutline, Profile } from "@/lib/types";

export type NextStepState =
  | { kind: "watch"; course: CourseWithMeta; index: number; lesson: LessonOutline; started: boolean }
  | { kind: "pay"; lockedCount: number; pending: boolean }
  | { kind: "done" }
  | { kind: "empty" };

/** Works out the one thing this learner should do next. */
export function nextStepFor(
  courses: CourseWithMeta[],
  profile: Profile,
  paymentPending: boolean
): NextStepState {
  if (courses.every((c) => c.lessonCount === 0)) return { kind: "empty" };

  const started = courses.some((c) => c.completedLessons > 0);
  for (const [index, course] of courses.entries()) {
    const done = new Set(course.completedLessonIds);
    const lesson = course.lessons.find((l) => !done.has(l.id) && canAccessLesson(l, profile));
    if (lesson) return { kind: "watch", course, index, lesson, started };
  }

  const lockedCount = courses.reduce(
    (sum, c) =>
      sum +
      c.lessons.filter(
        (l) => !c.completedLessonIds.includes(l.id) && !canAccessLesson(l, profile)
      ).length,
    0
  );
  if (lockedCount > 0) return { kind: "pay", lockedCount, pending: paymentPending };
  return { kind: "done" };
}

/** Where the step's button goes, shared with the phone's sticky bar. */
export function nextStepAction(step: NextStepState) {
  switch (step.kind) {
    case "watch":
      return {
        href: lessonHref(step.course.slug, step.lesson.id),
        label: step.started ? "Үргэлжлүүлэх" : "Эхний хичээлээ үзэх",
        hint: step.lesson.title,
      };
    case "pay":
      return step.pending
        ? null
        : { href: "/premium", label: "Premium авах", hint: `Үлдсэн ${step.lockedCount} хичээл нээгдэнэ` };
    default:
      return null;
  }
}

/**
 * The dashboard's lead card: one sentence on where the learner is and one
 * big button for what to do now.
 */
export function NextStep({ step }: { step: NextStepState }) {
  if (step.kind === "watch") {
    const href = lessonHref(step.course.slug, step.lesson.id);
    return (
      <div className="overflow-hidden rounded-xl border-2 border-brand-600 bg-white">
        <div className="grid sm:grid-cols-[220px_1fr]">
          <Link href={href} className="group relative block aspect-video bg-navy-900 sm:aspect-auto">
            {step.course.cover_image && (
              <Image
                src={step.course.cover_image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 220px"
                className="object-cover"
              />
            )}
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform group-hover:scale-105">
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </span>
          </Link>
          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-brand-700">
              {step.started ? "Дараагийн хичээл" : "Эхлэх цэг"}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug text-navy-900">
              {step.lesson.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Курс {courseNumber(step.index)} · {step.course.title}
            </p>
            <Link
              href={href}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-700"
            >
              <Play size={16} fill="currentColor" />
              {step.started ? "Үргэлжлүүлэх" : "Эхний хичээлээ үзэх"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step.kind === "pay") {
    return step.pending ? (
      <div className="rounded-xl border-2 border-gold-300 bg-gold-100/50 p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-gold-700">
          <Clock size={16} /> Төлбөр шалгагдаж байна
        </p>
        <h2 className="mt-1 text-xl font-semibold text-navy-900">Удахгүй бүх хичээл нээгдэнэ</h2>
        <p className="mt-1 text-sm text-slate-600">
          Админ төлбөрийг баталгаажуулмагц үлдсэн {step.lockedCount} хичээл автоматаар нээгдэнэ.
          Танд өөр юу ч хийх шаардлагагүй.
        </p>
      </div>
    ) : (
      <div className="rounded-xl border-2 border-brand-600 bg-white p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
          <Lock size={15} /> Үнэгүй хичээлүүдээ үзэж дууслаа
        </p>
        <h2 className="mt-1 text-xl font-semibold text-navy-900">
          Үлдсэн {step.lockedCount} хичээлийг нээх үү?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Premium авбал бүх курсын бүх хичээл 6 сарын турш нээлттэй болно.
        </p>
        <Link
          href="/premium"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-700"
        >
          Premium авах <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (step.kind === "done") {
    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <PartyPopper size={16} /> Баяр хүргэе!
        </p>
        <h2 className="mt-1 text-xl font-semibold text-navy-900">Та бүх хичээлийг үзэж дууслаа</h2>
        <p className="mt-1 text-sm text-slate-600">
          Хичээлүүд таньд нээлттэй хэвээр. Хүссэн үедээ дахин үзэж болно.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
      Хичээлүүд удахгүй нэмэгдэнэ.
    </div>
  );
}
