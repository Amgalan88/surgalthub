import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { LessonList } from "@/components/course/LessonList";
import { lessonHref } from "@/components/course/courseLinks";
import { PremiumOffer } from "@/components/premium/PremiumOffer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getCourseBySlug,
  getLessonById,
  getLessonOutline,
} from "@/lib/data/courses";
import { ensureEnrollment, getCompletedLessonIds } from "@/lib/data/progress";
import { getLessonQuestions, getMyLessonFeedback } from "@/lib/data/engagement";
import { LessonHelp } from "@/components/lesson/LessonHelp";
import { getCurrentProfile } from "@/lib/auth";
import { markLessonComplete } from "@/lib/actions/learning";
import { isYoutubeUrl, toYoutubeEmbedUrl } from "@/lib/video";
import { canAccessLesson, isPremiumActive } from "@/lib/access";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug, lessonId } = await params;
  const course = await getCourseBySlug(decodeURIComponent(rawSlug));
  if (!course) return { robots: { index: false } };
  const outline = await getLessonOutline(course.id);
  const lesson = outline.find((l) => l.id === lessonId);
  return {
    title: lesson ? `${lesson.title} — ${course.title}` : course.title,
    robots: { index: false },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug: rawSlug, lessonId } = await params;
  const slug = decodeURIComponent(rawSlug);

  const [course, profile] = await Promise.all([getCourseBySlug(slug), getCurrentProfile()]);
  if (!course) notFound();

  const lessons = await getLessonOutline(course.id);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const outline = lessons[index];
  const completedIds = profile
    ? await getCompletedLessonIds(
        profile.id,
        lessons.map((l) => l.id)
      )
    : new Set<string>();
  const isDone = completedIds.has(outline.id);

  // Free lessons are open to everyone, signed in or not; the course page
  // explains how to unlock the rest.
  if (!canAccessLesson(outline, profile, isDone)) {
    redirect(`/courses/${slug}?locked=1`);
  }

  // RLS is the real gate: this returns null when the caller may not read it.
  const lesson = await getLessonById(lessonId);
  if (!lesson) redirect(`/courses/${slug}?locked=1`);

  const [questions, myFeedback] = profile
    ? await Promise.all([
        getLessonQuestions(lessonId),
        getMyLessonFeedback(lessonId, profile.id),
        ensureEnrollment(profile.id, course.id),
      ])
    : [[], null];

  const prevLesson = lessons[index - 1];
  const nextLesson = lessons[index + 1];
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isYoutube = lesson.video_url ? isYoutubeUrl(lesson.video_url) : false;
  const embedUrl = isYoutube && lesson.video_url ? toYoutubeEmbedUrl(lesson.video_url) : null;
  const hasPremium = profile?.role === "admin" || isPremiumActive(profile);
  const lockedCount = lessons.filter(
    (l) => !canAccessLesson(l, profile, completedIds.has(l.id))
  ).length;

  // After "complete", carry on to the next lesson if it is open to this
  // learner; otherwise the course page, which explains what unlocks the rest.
  const nextAccessible =
    nextLesson && canAccessLesson(nextLesson, profile, completedIds.has(nextLesson.id));
  const continueTo = nextAccessible ? lessonHref(slug, nextLesson.id) : `/courses/${slug}`;
  const completeAction = markLessonComplete.bind(null, slug, lesson.id, continueTo);
  const here = lessonHref(slug, lesson.id);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex min-w-0 items-center gap-1 text-slate-500 hover:text-navy-900"
        >
          <ChevronLeft size={16} className="shrink-0" />
          <span className="truncate">{course.title}</span>
        </Link>
        <span className="shrink-0 tabular-nums text-slate-500">
          Хичээл {index + 1} / {lessons.length}
        </span>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          {lesson.video_url &&
            (embedUrl ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                key={lesson.id}
                src={lesson.video_url}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                poster={lesson.cover_image_url ?? undefined}
                className="aspect-video w-full rounded-xl bg-black"
              />
            ))}

          {lesson.cover_image_url && !lesson.video_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lesson.cover_image_url}
              alt={lesson.title}
              className="max-h-96 w-full rounded-xl object-cover"
            />
          )}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-navy-900">
                {lesson.title}
              </h1>
              {outline.is_free_preview && !hasPremium && (
                <p className="mt-1 text-sm text-emerald-700">Үнэгүй хичээл</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {prevLesson && (
                <LinkButton
                  href={lessonHref(slug, prevLesson.id)}
                  variant="outline"
                  aria-label="Өмнөх хичээл"
                  className="px-3"
                >
                  <ChevronLeft size={16} />
                </LinkButton>
              )}
              {profile && !isDone ? (
                <form action={completeAction} className="flex-1 sm:flex-none">
                  <SubmitButton className="w-full" pendingLabel="Хадгалж байна...">
                    <CheckCircle2 size={16} />
                    {nextAccessible ? "Дуусгаад дараагийнх" : "Үзэж дууслаа"}
                  </SubmitButton>
                </form>
              ) : nextLesson ? (
                <LinkButton
                  href={nextAccessible ? lessonHref(slug, nextLesson.id) : `/courses/${slug}?locked=1`}
                  className="flex-1 sm:flex-none"
                >
                  Дараагийн хичээл <ChevronRight size={16} />
                </LinkButton>
              ) : (
                <LinkButton href={`/courses/${slug}`} variant="outline" className="flex-1 sm:flex-none">
                  Курс руу буцах
                </LinkButton>
              )}
            </div>
          </div>

          {profile && isDone && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 size={15} /> Та энэ хичээлийг үзэж дуусгасан
            </p>
          )}

          {!profile && (
            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-sm leading-relaxed text-slate-600">
                <span className="font-medium text-navy-900">Үнэгүй бүртгүүлээрэй.</span>{" "}
                Үзсэн хичээл тань хадгалагдаж, ойлгомжгүй зүйлээ багшаас асууж болно.
              </p>
              <div className="flex shrink-0 gap-2">
                <LinkButton href={`/register?next=${encodeURIComponent(here)}`} size="sm">
                  Бүртгүүлэх
                </LinkButton>
                <LinkButton href={`/login?next=${encodeURIComponent(here)}`} size="sm" variant="outline">
                  Нэвтрэх
                </LinkButton>
              </div>
            </div>
          )}

          {lesson.audio_url && (
            <audio
              src={lesson.audio_url}
              controls
              preload="metadata"
              controlsList="nodownload"
              className="mt-6 w-full"
            />
          )}

          {lesson.slides_url && (
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <FileText size={16} /> Слайд
                </span>
                <a
                  href={lesson.slides_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-700"
                >
                  Шинэ цонхоор нээх
                </a>
              </div>
              <iframe
                src={lesson.slides_url}
                loading="lazy"
                className="h-[420px] w-full sm:h-[600px]"
                title="Слайд"
              />
            </div>
          )}

          {lesson.content_md.trim() && (
            <article className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-headings:text-navy-900 prose-a:text-brand-700">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => {
                    const external = href ? /^https?:\/\//.test(href) : false;
                    return (
                      <a
                        href={href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {children}
                      </a>
                    );
                  },
                  img: ({ src, alt }) => (
                    // Markdown images can come from any host, so next/image
                    // (which needs an allow-list) does not fit here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={typeof src === "string" ? src : undefined}
                      alt={alt ?? ""}
                      loading="lazy"
                    />
                  ),
                }}
              >
                {lesson.content_md}
              </ReactMarkdown>
            </article>
          )}

          {profile && (
            <LessonHelp
              courseSlug={slug}
              lessonId={lesson.id}
              questions={questions}
              myFeedback={myFeedback}
              currentUserId={profile.id}
            />
          )}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {profile && (
            <div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Таны явц</span>
                <span className="tabular-nums">
                  {completedCount}/{lessons.length}
                </span>
              </div>
              <ProgressBar value={progressPct} className="mt-2" />
            </div>
          )}
          <div className="lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
            <LessonList
              courseSlug={slug}
              lessons={lessons}
              completedIds={completedIds}
              profile={profile}
              currentLessonId={lesson.id}
              compact
            />
          </div>
          {lockedCount > 0 && !hasPremium && <PremiumOffer lessonCount={lockedCount} />}
        </aside>
      </div>
    </div>
  );
}
