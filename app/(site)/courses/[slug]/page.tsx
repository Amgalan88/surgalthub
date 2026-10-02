import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Crown,
  CheckCircle2,
  Landmark,
  Lock,
  Clock,
  BookOpen,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonRoadmap } from "@/components/course/LessonRoadmap";
import { getCourseBySlug, getLessonOutline } from "@/lib/data/courses";
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
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(decodeURIComponent(slug));
  if (!course) return { title: "Сургалт олдсонгүй", robots: { index: false } };

  const description = course.description.slice(0, 200);
  const path = `/courses/${course.slug}`;
  return {
    title: course.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: course.title,
      description,
      url: path,
      ...(course.cover_image ? { images: [{ url: course.cover_image }] } : {}),
    },
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locked?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { locked } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [lessons, profile] = await Promise.all([
    getLessonOutline(course.id),
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
  const allLessonsAccessible = lessons.every((l) =>
    canAccessLesson(l, profile, completedIds.has(l.id))
  );

  const enrollAction = enrollInCourse.bind(null, course.slug, course.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: `${getSiteUrl()}/courses/${course.slug}`,
    inLanguage: "mn",
    provider: { "@type": "Organization", name: SITE_NAME, sameAs: getSiteUrl() },
    ...(course.cover_image ? { image: course.cover_image } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(course.duration_label ? { courseWorkload: course.duration_label } : {}),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        // JSON.stringify output is escaped for "<" so admin-entered text
        // cannot close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {course.duration_label && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-brand-400" />
                {course.duration_label}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <BookOpen size={15} className="text-brand-400" />
              {total} хичээл
            </span>
            {course.outcomes.length > 0 && (
              <span className="flex items-center gap-1.5">
                <ListChecks size={15} className="text-brand-400" />
                {course.outcomes.length} суралцахуй
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {locked === "1" && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
            <Lock size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p>
              Тухайн хичээл нээгдээгүй байна — энэ нь Premium эрх шаарддаг бөгөөд
              танд одоогоор идэвхтэй Premium байхгүй тул үзэх боломжгүй. Доорх
              зааврын дагуу төлбөрөө шилжүүлээд админтай холбогдоорой.
            </p>
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {course.outcomes.length > 0 && (
              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
                  <ListChecks size={19} className="text-brand-600" />
                  Юу сурах вэ?
                </h2>
                <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {course.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="text-xl font-semibold text-navy-900">Сургалтын зам</h2>
            <p className="mt-1 text-sm text-slate-500">
              Хичээлүүдийн бүрэн хөтөлбөр, алхам алхмаар.
            </p>
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
                    Хичээл үзэхийн тулд эхлээд бүртгэлдээ нэвтэрнэ үү. Бүртгэл
                    үүсгэх үнэгүй.
                  </p>
                  <Link
                    href={`/register?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                    data-tour="enroll-cta"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Үнэгүй бүртгүүлэх
                  </Link>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    Нэвтрэх
                  </Link>
                </>
              ) : !enrollment ? (
                <>
                  <p className="text-sm text-slate-500">
                    Энэ сургалтад нэгдээд хичээлээ эхлүүлээрэй. Нэгдэх үнэгүй.
                  </p>
                  <form action={enrollAction} className="mt-4">
                    <SubmitButton
                      className="w-full"
                      size="lg"
                      pendingLabel="Түр хүлээнэ үү..."
                      data-tour="enroll-cta"
                    >
                      Сургалтад нэгдэх
                    </SubmitButton>
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
                      <Link
                        href="/premium"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Дэлгэрэнгүй заавар <ArrowRight size={14} />
                      </Link>
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
