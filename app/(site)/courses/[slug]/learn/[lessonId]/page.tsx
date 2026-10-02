import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getCourseBySlug,
  getLessonById,
  getLessonOutline,
} from "@/lib/data/courses";
import { getCompletedLessonIds, getEnrollment } from "@/lib/data/progress";
import { getLessonQuestions, getMyLessonFeedback } from "@/lib/data/engagement";
import { LessonHelp } from "@/components/lesson/LessonHelp";
import { getCurrentProfile } from "@/lib/auth";
import { markLessonComplete } from "@/lib/actions/learning";
import { isYoutubeUrl, toYoutubeEmbedUrl } from "@/lib/video";
import { canAccessLesson } from "@/lib/access";

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

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/courses/${slug}/learn/${lessonId}`);

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await getEnrollment(profile.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const lessons = await getLessonOutline(course.id);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const outline = lessons[index];
  const completedIds = await getCompletedLessonIds(
    profile.id,
    lessons.map((l) => l.id)
  );
  const isDone = completedIds.has(outline.id);
  if (!canAccessLesson(outline, profile, isDone)) {
    redirect(`/courses/${slug}?locked=1`);
  }

  // RLS is the real gate: this returns null when the caller may not read it.
  const lesson = await getLessonById(lessonId);
  if (!lesson) redirect(`/courses/${slug}?locked=1`);

  const [questions, myFeedback] = await Promise.all([
    getLessonQuestions(lessonId),
    getMyLessonFeedback(lessonId, profile.id),
  ]);

  const prevLesson = lessons[index - 1];
  const nextLesson = lessons[index + 1];
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isYoutube = lesson.video_url ? isYoutubeUrl(lesson.video_url) : false;
  const embedUrl = isYoutube && lesson.video_url ? toYoutubeEmbedUrl(lesson.video_url) : null;

  // After "complete", carry on to the next lesson if it is open to this
  // learner; otherwise the course page, which explains what unlocks the rest.
  const nextAccessible =
    nextLesson && canAccessLesson(nextLesson, profile, completedIds.has(nextLesson.id));
  const continueTo = nextAccessible
    ? `/courses/${slug}/learn/${nextLesson.id}`
    : `/courses/${slug}`;
  const completeAction = markLessonComplete.bind(null, slug, lesson.id, continueTo);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <Link
              href={`/courses/${slug}`}
              className="text-sm font-medium text-slate-500 hover:text-navy-900"
            >
              ← {course.title}
            </Link>
            <ol className="mt-4 space-y-1" data-tour="lesson-sidebar">
              {lessons.map((l, i) => {
                const accessible = canAccessLesson(l, profile, completedIds.has(l.id));
                const content = (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                      l.id === lesson.id
                        ? "bg-brand-50 font-medium text-brand-700"
                        : accessible
                          ? "text-slate-600 hover:bg-slate-50"
                          : "text-slate-400"
                    )}
                  >
                    {!accessible ? (
                      <Lock size={16} className="shrink-0 text-slate-300" />
                    ) : completedIds.has(l.id) ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    ) : (
                      <PlayCircle size={16} className="shrink-0 text-slate-300" />
                    )}
                    <span className="line-clamp-1">
                      {i + 1}. {l.title}
                    </span>
                  </div>
                );
                return (
                  <li key={l.id}>
                    {accessible ? (
                      <Link href={`/courses/${slug}/learn/${l.id}`}>{content}</Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        <main className="order-1 lg:order-2">
          {/* On mobile the lesson list sits below the content, so the way back
              to the course needs to be reachable from the top too. */}
          <Link
            href={`/courses/${slug}`}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy-900 lg:hidden"
          >
            <ChevronLeft size={15} /> {course.title}
          </Link>

          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200/80">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-navy-900">
                {index + 1} / {lessons.length} хичээл
              </span>
              <span className="text-slate-500">
                {completedCount} дууссан ({progressPct}%)
              </span>
            </div>
            <ProgressBar value={progressPct} className="mt-2" />
          </div>

          <h1 className="text-2xl font-bold text-navy-900">{lesson.title}</h1>

          {lesson.cover_image_url && !lesson.video_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lesson.cover_image_url}
              alt={lesson.title}
              className="mt-5 max-h-96 w-full rounded-xl object-cover"
            />
          )}

          {lesson.video_url &&
            (embedUrl ? (
              <div className="mt-5 aspect-video overflow-hidden rounded-xl bg-black">
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
                src={lesson.video_url}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                poster={lesson.cover_image_url ?? undefined}
                className="mt-5 max-h-[480px] w-full rounded-xl bg-black"
              />
            ))}

          {lesson.audio_url && (
            <audio
              src={lesson.audio_url}
              controls
              preload="metadata"
              controlsList="nodownload"
              className="mt-5 w-full"
            />
          )}

          {lesson.slides_url && (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <FileText size={16} /> Слайд
                </span>
                <a
                  href={lesson.slides_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-600"
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

          <article className="prose prose-slate mt-6 max-w-none prose-headings:text-navy-900 prose-a:text-brand-600">
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

          <LessonHelp
            courseSlug={slug}
            lessonId={lesson.id}
            questions={questions}
            myFeedback={myFeedback}
            currentUserId={profile.id}
          />

          {/* pb-16 keeps the full-width mobile buttons clear of the floating
              tour launcher pinned to the bottom-right of the viewport. */}
          <div
            className="mt-10 flex flex-col gap-4 border-t border-slate-200 pb-16 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pb-0"
            data-tour="lesson-nav"
          >
            <div>
              {prevLesson ? (
                <Link
                  href={`/courses/${slug}/learn/${prevLesson.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-navy-900"
                >
                  <ChevronLeft size={16} /> Өмнөх
                </Link>
              ) : (
                <span />
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isDone && (
                <form action={completeAction}>
                  <SubmitButton
                    className="w-full sm:w-auto"
                    pendingLabel="Хадгалж байна..."
                    data-tour="mark-complete-btn"
                  >
                    <CheckCircle2 size={16} />
                    {nextAccessible ? "Дуусгаад дараагийнх руу" : "Дуусгасан гэж тэмдэглэх"}
                  </SubmitButton>
                </form>
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${slug}/learn/${nextLesson.id}`}
                  className={cn(
                    "inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium",
                    isDone
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  )}
                >
                  {isDone ? "Дараах" : "Алгасах"} <ChevronRight size={16} />
                </Link>
              ) : (
                isDone && (
                  <Link
                    href={`/courses/${slug}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Курс руу буцах
                  </Link>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
