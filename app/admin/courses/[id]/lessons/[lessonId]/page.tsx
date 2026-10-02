import { notFound } from "next/navigation";
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
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        {course.title} — Хичээл засах
      </h1>

      <Card className="mt-6">
        <CardBody>
          <LessonForm courseId={id} lesson={lesson} action={updateLesson} />
        </CardBody>
      </Card>
    </div>
  );
}
