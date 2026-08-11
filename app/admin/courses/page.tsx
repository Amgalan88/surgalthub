import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { getAllCoursesAdmin } from "@/lib/data/admin";
import { deleteCourse, toggleCoursePublished } from "@/lib/actions/admin/courses";
import { TRACK_LABELS } from "@/lib/types";

export default async function AdminCoursesPage() {
  const courses = await getAllCoursesAdmin();

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Сургалтууд</h1>
          <p className="mt-1 text-slate-500">Курс, хичээл, шалгалт удирдах</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Шинэ курс
        </Link>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Нэр</th>
                <th className="px-5 py-3 font-medium">Чиглэл</th>
                <th className="px-5 py-3 font-medium">Хичээл</th>
                <th className="px-5 py-3 font-medium">Бүртгэл</th>
                <th className="px-5 py-3 font-medium">Төлөв</th>
                <th className="px-5 py-3 font-medium text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => {
                const toggleAction = toggleCoursePublished.bind(
                  null,
                  course.id,
                  !course.published
                );
                const deleteAction = deleteCourse.bind(null, course.id);
                return (
                  <tr key={course.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">
                      {course.title}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {TRACK_LABELS[course.track]}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {course.lesson_count}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {course.enrollment_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={course.published ? "green" : "slate"}>
                        {course.published ? "Нийтэлсэн" : "Ноорог"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <form action={toggleAction}>
                          <button
                            type="submit"
                            title={course.published ? "Нуух" : "Нийтлэх"}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          >
                            {course.published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </form>
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          title="Засах"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </Link>
                        <form action={deleteAction}>
                          <ConfirmSubmitButton
                            confirmMessage={`"${course.title}" курсыг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`}
                            title="Устгах"
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Курс алга байна. Эхний курсаа үүсгээрэй.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
