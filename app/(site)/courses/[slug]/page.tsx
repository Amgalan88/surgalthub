import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Lock, Play } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { StickyCta } from "@/components/ui/StickyCta";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonList } from "@/components/course/LessonList";
import { courseNumber, primaryCourseAction } from "@/components/course/courseLinks";
import { PremiumOffer } from "@/components/premium/PremiumOffer";
import { getCourseBySlug, getCoursePosition, getLessonOutline } from "@/lib/data/courses";
import { getCompletedLessonIds } from "@/lib/data/progress";
import { getCurrentProfile } from "@/lib/auth";
import { getMyPaymentState } from "@/lib/data/payments";
import { canAccessLesson, isPremiumActive } from "@/lib/access";
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

  const [lessons, profile, position] = await Promise.all([
    getLessonOutline(course.id),
    getCurrentProfile(),
    getCoursePosition(course.id),
  ]);

  const completedIds = profile
    ? await getCompletedLessonIds(
        profile.id,
        lessons.map((l) => l.id)
      )
    : new Set<string>();

  const total = lessons.length;
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const freeCount = lessons.filter((l) => l.is_free_preview).length;
  const lockedCount = lessons.filter(
    (l) => !canAccessLesson(l, profile, completedIds.has(l.id))
  ).length;
  const hasPremium = profile?.role === "admin" || isPremiumActive(profile);
  const paymentPending =
    profile && lockedCount > 0 && !hasPremium
      ? Boolean((await getMyPaymentState(profile.id)).pending)
      : false;
  const action = primaryCourseAction(course.slug, lessons, completedIds, profile);
  const nextLessonId = lessons.find(
    (l) => !completedIds.has(l.id) && canAccessLesson(l, profile)
  )?.id;

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

      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/courses" className="hover:text-navy-900">
              Сургалтууд
            </Link>
            <ChevronRight size={14} />
            <span className="truncate">
              {position ? `Курс ${courseNumber(position - 1)}` : course.title}
            </span>
          </nav>

          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                {course.description}
              </p>
              <p className="mt-5 flex flex-wrap gap-x-2 text-sm text-slate-500">
                <span>{total} хичээл</span>
                {course.duration_label && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{course.duration_label}</span>
                  </>
                )}
                {freeCount > 0 && !hasPremium && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-emerald-700">{freeCount} нь үнэгүй</span>
                  </>
                )}
              </p>

              {total > 0 && (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <LinkButton href={action.href} size="lg">
                    {action.locked ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}
                    {action.label}
                  </LinkButton>
                  {!profile && (
                    <p className="text-sm text-slate-500">
                      Бүртгэлгүйгээр үзэж болно.{" "}
                      <Link
                        href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                        className="font-medium text-brand-700 hover:text-brand-800"
                      >
                        Нэвтрэх
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {completedCount > 0 && (
                <div className="mt-8 max-w-sm">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Таны явц</span>
                    <span>
                      {completedCount}/{total} хичээл
                    </span>
                  </div>
                  <ProgressBar value={progressPct} className="mt-2" />
                </div>
              )}
            </div>

            {course.cover_image && (
              <Link
                href={action.href}
                className="group relative block aspect-video overflow-hidden rounded-xl bg-navy-900 ring-1 ring-navy-900/10"
              >
                <Image
                  src={course.cover_image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform group-hover:scale-105">
                  {action.locked ? (
                    <Lock size={20} />
                  ) : (
                    <Play size={22} fill="currentColor" className="ml-0.5" />
                  )}
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {locked === "1" && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-100/60 px-4 py-3.5 text-sm text-navy-900">
            <Lock size={17} className="mt-0.5 shrink-0 text-gold-700" />
            <p>
              Энэ хичээл Premium эрхтэй хүнд нээгдэнэ.{" "}
              <Link href="/premium" className="font-medium text-brand-700 underline underline-offset-2">
                Premium хэрхэн авах вэ
              </Link>
              {!profile && (
                <>
                  {" "}· Premium эрхтэй бол{" "}
                  <Link
                    href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                    className="font-medium text-brand-700 underline underline-offset-2"
                  >
                    нэвтэрнэ үү
                  </Link>
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {course.outcomes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-navy-900">Юу сурах вэ</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-slate-700">
                      <Check size={18} className="mt-0.5 shrink-0 text-brand-600" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="text-xl font-semibold text-navy-900">Хичээлүүд</h2>
            {total === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-slate-500">
                Хичээлүүд удахгүй нэмэгдэнэ.
              </p>
            ) : (
              <div className="mt-4">
                <LessonList
                  courseSlug={course.slug}
                  lessons={lessons}
                  completedIds={completedIds}
                  profile={profile}
                  currentLessonId={completedCount > 0 ? nextLessonId : undefined}
                />
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {lockedCount > 0 ? (
              <PremiumOffer lessonCount={lockedCount} pending={paymentPending} />
            ) : (
              hasPremium && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  <p className="font-medium text-navy-900">Бүх хичээл нээлттэй</p>
                  <p className="mt-1">Танд Premium эрх идэвхтэй байна.</p>
                </div>
              )
            )}
            {!profile && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                <p className="font-medium text-navy-900">Явцаа хадгалах уу?</p>
                <p className="mt-1 leading-relaxed">
                  Үнэгүй бүртгүүлбэл үзсэн хичээлээ тэмдэглэж, дараа нь
                  орхисон газраасаа үргэлжлүүлнэ.
                </p>
                <LinkButton
                  href={`/register?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  Үнэгүй бүртгүүлэх
                </LinkButton>
              </div>
            )}
          </aside>
        </div>
      </div>
      {total > 0 && (
        <StickyCta
          href={action.href}
          label={action.label}
          icon={action.locked ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}
        />
      )}
    </div>
  );
}
