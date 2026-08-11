import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, CheckCircle2, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonRoadmap } from "@/components/course/LessonRoadmap";
import { getCourseBySlug, getLessonsForCourse } from "@/lib/data/courses";
import { getCompletedLessonIds, getEnrollment } from "@/lib/data/progress";
import { getCurrentProfile } from "@/lib/auth";
import { enrollInCourse } from "@/lib/actions/learning";
import {
  canAccessLesson,
  formatMNT,
  isPremiumActive,
  PAYMENT_INFO,
  PREMIUM_DURATION_MONTHS,
  PREMIUM_PRICE_MNT,
} from "@/lib/access";
import { TRACK_LABELS } from "@/lib/types";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
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

  const total = lessons.length;
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const firstUnfinished = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];
  const firstAccessibleUnfinished = lessons.find(
    (l) => !completedIds.has(l.id) && canAccessLesson(l, profile)
  );
  const hasPremium = isPremiumActive(profile) || profile?.role === "admin";
  const hasPremiumLessons = lessons.some((l) => !l.is_free_preview);
  const allLessonsAccessible = lessons.every((l) => canAccessLesson(l, profile));

  const enrollAction = enrollInCourse.bind(null, course.slug, course.id);

  return (
    <div>
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{TRACK_LABELS[course.track]}</Badge>
            {hasPremiumLessons && (
              <Badge tone="slate" className="bg-white/10 text-brand-200 ring-white/20">
                <Crown size={12} /> Premium хичээлтэй
              </Badge>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">{course.description}</p>
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
                enrollment={enrollment}
                profile={profile}
                currentLessonId={firstUnfinished?.id}
              />
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {!profile ? (
                <>
                  <p className="text-sm text-slate-500">
                    Сургалтад бүртгүүлэхийн тулд эхлээд нэвтэрнэ үү.
                  </p>
                  <Link
                    href={`/login?next=/courses/${course.slug}`}
                    data-tour="enroll-cta"
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
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      data-tour="enroll-cta"
                    >
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

                  {firstAccessibleUnfinished ? (
                    <Link
                      href={`/courses/${course.slug}/learn/${firstAccessibleUnfinished.id}`}
                      data-tour="enroll-cta"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      {completedCount === 0 ? "Эхлэх" : "Үргэлжлүүлэх"}
                    </Link>
                  ) : total > 0 && completedCount === total && allLessonsAccessible ? (
                    <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                      Та энэ сургалтыг амжилттай дуусгалаа!
                    </div>
                  ) : !hasPremium && hasPremiumLessons ? (
                    <div className="mt-5 rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <Crown size={15} /> Premium хичээлүүд
                      </p>
                      <p className="mt-1 text-brand-700/80">
                        Үлдсэн хичээлүүдийг {PREMIUM_DURATION_MONTHS} сарын турш
                        хүссэн үедээ үзэхийн тулд {formatMNT(PREMIUM_PRICE_MNT)}
                        -г доорх дансанд шилжүүлээд, баримтаа админд
                        (нэр/утас/имэйлээ дурдаж) илгээгээрэй.
                      </p>
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 ring-1 ring-inset ring-brand-200">
                        <Landmark size={16} className="shrink-0 text-brand-600" />
                        <p className="text-xs text-navy-900">
                          <span className="font-semibold">{PAYMENT_INFO.bank}</span>{" "}
                          — {PAYMENT_INFO.account} (
                          {PAYMENT_INFO.accountHolder})
                        </p>
                      </div>
                    </div>
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
