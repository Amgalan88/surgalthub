import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { LessonForm } from "@/components/admin/LessonForm";
import { getCourseByIdAdmin } from "@/lib/data/admin";
import { getLessonsForCourse } from "@/lib/data/courses";
import { createLesson } from "@/lib/actions/admin/lessons";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  const lessons = await getLessonsForCourse(id);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        {course.title} — Хичээл нэмэх
      </h1>

      <Card className="mt-6">
        <CardBody>
          <LessonForm
            courseId={id}
            nextOrderIndex={lessons.length}
            action={createLesson}
          />
        </CardBody>
      </Card>
    </div>
  );
}
