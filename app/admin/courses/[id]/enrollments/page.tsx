import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCourseByIdAdmin, getCourseEnrollments } from "@/lib/data/admin";
import { setEnrollmentPaid } from "@/lib/actions/admin/enrollments";
import { formatMNT } from "@/lib/access";

export default async function AdminEnrollmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  const rows = await getCourseEnrollments(id);

  return (
    <div className="p-6 sm:p-8">
      <Link href={`/admin/courses/${id}/edit`} className="text-sm text-slate-500">
        ← {course.title}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Бүртгүүлсэн хэрэглэгчид</h1>
          <p className="mt-1 text-slate-500">
            Курсын үнэ: {formatMNT(course.price)}. Төлбөр төлсөн хэрэглэгчид
            premium хичээлүүдийг бүрэн үзэх боломжтой болно.
          </p>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden" data-tour="admin-enrollments-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Хэрэглэгч</th>
                <th className="px-5 py-3 font-medium">Бүртгүүлсэн</th>
                <th className="px-5 py-3 font-medium">Төлбөрийн төлөв</th>
                <th className="px-5 py-3 font-medium text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ enrollment, profile }) => {
                const toggleAction = setEnrollmentPaid.bind(
                  null,
                  id,
                  enrollment.id,
                  !enrollment.has_paid
                );
                return (
                  <tr key={enrollment.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">
                      {profile?.full_name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(enrollment.enrolled_at).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={enrollment.has_paid ? "green" : "slate"}>
                        {enrollment.has_paid ? "Төлсөн" : "Төлөөгүй"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={toggleAction}>
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {enrollment.has_paid ? "Төлбөрийг цуцлах" : "Төлбөр төлсөн гэж тэмдэглэх"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    Хэрэглэгч бүртгүүлээгүй байна.
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
