import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getCourseBySlug, getLessonsForCourse } from "@/lib/data/courses";
import { getCompletedLessonIds, getEnrollment } from "@/lib/data/progress";
import { getCurrentProfile } from "@/lib/auth";
import { markLessonComplete } from "@/lib/actions/learning";
import { isYoutubeUrl, toYoutubeEmbedUrl } from "@/lib/video";
import { canAccessLesson } from "@/lib/access";

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

  const lessons = await getLessonsForCourse(course.id);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const lesson = lessons[index];
  const completedIds = await getCompletedLessonIds(
    profile.id,
    lessons.map((l) => l.id)
  );
  const isDone = completedIds.has(lesson.id);
  if (!canAccessLesson(lesson, profile, isDone)) {
    redirect(`/courses/${slug}?locked=1`);
  }

  const prevLesson = lessons[index - 1];
  const nextLesson = lessons[index + 1];
  const isYoutube = lesson.video_url ? isYoutubeUrl(lesson.video_url) : false;
  const embedUrl = isYoutube && lesson.video_url ? toYoutubeEmbedUrl(lesson.video_url) : null;

  const completeAction = markLessonComplete.bind(null, slug, lesson.id);

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
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={lesson.video_url}
                controls
                poster={lesson.cover_image_url ?? undefined}
                className="mt-5 max-h-[480px] w-full rounded-xl bg-black"
              />
            ))}

          {lesson.audio_url && (
            <audio src={lesson.audio_url} controls className="mt-5 w-full" />
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
                  rel="noreferrer"
                  className="text-sm font-medium text-brand-600"
                >
                  Шинэ цонхоор нээх
                </a>
              </div>
              <iframe src={lesson.slides_url} className="h-[600px] w-full" title="Слайд" />
            </div>
          )}

          <article className="prose prose-slate mt-6 max-w-none prose-headings:text-navy-900 prose-a:text-brand-600">
            <ReactMarkdown>{lesson.content_md}</ReactMarkdown>
          </article>

          <div
            className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
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
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    data-tour="mark-complete-btn"
                  >
                    Дуусгасан гэж тэмдэглэх
                  </Button>
                </form>
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${slug}/learn/${nextLesson.id}`}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Дараах <ChevronRight size={16} />
                </Link>
              ) : (
                <Link
                  href={`/courses/${slug}`}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Курс руу буцах
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
