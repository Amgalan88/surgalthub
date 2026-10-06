import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { LessonForm } from "@/components/admin/LessonForm";
import { getCourseByIdAdmin } from "@/lib/data/admin";
import { getLessonsForCourse } from "@/lib/data/courses";
import { updateLesson } from "@/lib/actions/admin/lessons";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  const lessons = await getLessonsForCourse(id);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <div className="p-6 sm:p-8">
      <Link
        href={`/admin/courses/${id}/lessons`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900"
      >
        <ChevronLeft size={15} /> {course.title}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-900">{lesson.title}</h1>

      <Card className="mt-6">
        <CardBody>
          <LessonForm courseId={id} lesson={lesson} action={updateLesson} />
        </CardBody>
      </Card>
    </div>
  );
}
