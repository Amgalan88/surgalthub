import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getLessonsForCourse } from "@/lib/data/courses";
import {
  getCompletedLessonIds,
  getEnrollment,
  getQuizQuestionsPublic,
} from "@/lib/data/progress";
import { getCurrentProfile } from "@/lib/auth";
import { QuizForm } from "@/components/course/QuizForm";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/courses/${slug}/quiz`);

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await getEnrollment(profile.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const lessons = await getLessonsForCourse(course.id);
  const completedIds = await getCompletedLessonIds(
    profile.id,
    lessons.map((l) => l.id)
  );
  const allDone = lessons.length > 0 && completedIds.size === lessons.length;
  if (!allDone) redirect(`/courses/${slug}`);

  const questions = await getQuizQuestionsPublic(course.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900">
        {course.title} — Төгсөлтийн шалгалт
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Гэрчилгээ авахын тулд асуултын 70%-иас дээшийг зөв хариулна уу.
      </p>

      <div className="mt-8">
        {questions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            Энэ курст шалгалтын асуулт бэлэн болоогүй байна.
          </p>
        ) : (
          <QuizForm
            courseId={course.id}
            courseSlug={course.slug}
            questions={questions}
          />
        )}
      </div>
    </div>
  );
}
