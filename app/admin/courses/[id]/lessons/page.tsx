import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { getCourseByIdAdmin } from "@/lib/data/admin";
import { getLessonsForCourse } from "@/lib/data/courses";
import { deleteLesson } from "@/lib/actions/admin/lessons";

export default async function AdminLessonsPage({
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
      <Link href={`/admin/courses/${id}/edit`} className="text-sm text-slate-500">
        ← {course.title}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-900">Хичээлүүд</h1>
        <Link
          href={`/admin/courses/${id}/lessons/new`}
          data-tour="admin-add-lesson"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Хичээл нэмэх
        </Link>
      </div>

      <Card className="mt-6 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {lessons.map((lesson, i) => {
            const removeAction = deleteLesson.bind(null, id, lesson.id);
            return (
              <li key={lesson.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-sm text-slate-400">{i + 1}.</span>
                <span className="flex-1 text-sm font-medium text-navy-900">
                  {lesson.title}
                </span>
                <Link
                  href={`/admin/courses/${id}/lessons/${lesson.id}`}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  title="Засах"
                >
                  <Pencil size={16} />
                </Link>
                <form action={removeAction}>
                  <ConfirmSubmitButton
                    confirmMessage={`"${lesson.title}" хичээлийг устгах уу?`}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    title="Устгах"
                  >
                    <Trash2 size={16} />
                  </ConfirmSubmitButton>
                </form>
              </li>
            );
          })}
          {lessons.length === 0 && (
            <li className="px-5 py-12 text-center text-slate-400">
              Хичээл алга байна.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
