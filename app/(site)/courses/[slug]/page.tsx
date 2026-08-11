import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonRoadmap } from "@/components/course/LessonRoadmap";
import { getCourseBySlug, getLessonsForCourse } from "@/lib/data/courses";
import {
  getCertificate,
  getCompletedLessonIds,
  getEnrollment,
} from "@/lib/data/progress";
import { getCurrentProfile } from "@/lib/auth";
import { enrollInCourse } from "@/lib/actions/learning";
import { TRACK_LABELS } from "@/lib/types";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [lessons, profile] = await Promise.all([
    getLessonsForCourse(course.id),
    getCurrentProfile(),
  ]);

  const enrollment = profile ? await getEnrollment(profile.id, course.id) : null;
  const completedIds = profile
    ? await getCompletedLessonIds(
        profile.id,
        lessons.map((l) => l.id)
      )
    : new Set<string>();
  const certificate =
    profile && enrollment ? await getCertificate(profile.id, course.id) : null;

  const total = lessons.length;
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allLessonsDone = total > 0 && completedCount === total;
  const firstUnfinished = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];

  const enrollAction = enrollInCourse.bind(null, course.slug, course.id);

  return (
    <div>
      <section className="bg-navy-900">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Badge tone="brand">{TRACK_LABELS[course.track]}</Badge>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{course.description}</p>
          <p className="mt-4 text-sm text-slate-400">{total} хичээл</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-navy-900">Сургалтын зам</h2>
            {total === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
                Хичээл тун удахгүй нэмэгдэнэ.
              </div>
            ) : (
              <LessonRoadmap
                courseSlug={course.slug}
                lessons={lessons}
                completedIds={completedIds}
                canOpen={!!enrollment}
                currentLessonId={firstUnfinished?.id}
                hasQuiz={total > 0}
                allLessonsDone={allLessonsDone}
                quizPassed={!!certificate}
              />
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-slate-200 p-6">
              {!profile ? (
                <>
                  <p className="text-sm text-slate-500">
                    Сургалтад бүртгүүлэхийн тулд эхлээд нэвтэрнэ үү.
                  </p>
                  <Link
                    href={`/login?next=/courses/${course.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Нэвтрэх
                  </Link>
                </>
              ) : !enrollment ? (
                <>
                  <p className="text-sm text-slate-500">
                    Энэ сургалтад бүртгүүлж, хичээлээ эхлүүлээрэй.
                  </p>
                  <form action={enrollAction} className="mt-4">
                    <Button type="submit" className="w-full" size="lg">
                      Бүртгүүлэх
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Явц</span>
                    <span className="font-medium text-navy-900">
                      {completedCount}/{total}
                    </span>
                  </div>
                  <ProgressBar value={progressPct} className="mt-2" />

                  {certificate ? (
                    <Link
                      href={`/api/certificates/${certificate.id}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Гэрчилгээ татах
                    </Link>
                  ) : firstUnfinished ? (
                    <Link
                      href={`/courses/${course.slug}/learn/${firstUnfinished.id}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      {completedCount === 0 ? "Эхлэх" : "Үргэлжлүүлэх"}
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
