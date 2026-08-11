import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks, HelpCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { CourseForm } from "@/components/admin/CourseForm";
import { getCourseByIdAdmin } from "@/lib/data/admin";
import { updateCourse } from "@/lib/actions/admin/courses";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Курс засах</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/admin/courses/${course.id}/lessons`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ListChecks size={16} /> Хичээл удирдах
        </Link>
        <Link
          href={`/admin/courses/${course.id}/quiz`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <HelpCircle size={16} /> Шалгалт удирдах
        </Link>
      </div>

      <Card className="mt-6">
        <CardBody>
          <CourseForm course={course} action={updateCourse} />
        </CardBody>
      </Card>
    </div>
  );
}
