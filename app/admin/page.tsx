import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { getAdminStats } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Нийт хэрэглэгч",
      value: stats.totalUsers,
      icon: Users,
      tone: "text-brand-600 bg-brand-50",
    },
    {
      label: "Нийтлэгдсэн курс",
      value: `${stats.publishedCourses}/${stats.totalCourses}`,
      icon: BookOpen,
      tone: "text-navy-700 bg-navy-50",
    },
    {
      label: "Нийт бүртгэл",
      value: stats.totalEnrollments,
      icon: GraduationCap,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Курс дуусгах хувь",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      tone: "text-brand-600 bg-brand-50",
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Хяналтын самбар</h1>
      <p className="mt-1 text-slate-500">Платформын ерөнхий үзүүлэлт</p>

      <div
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        data-tour="admin-stats"
      >
        {cards.map((c) => (
          <Card key={c.label}>
            <CardBody>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.tone}`}
              >
                <c.icon size={19} />
              </span>
              <p className="mt-4 text-2xl font-bold text-navy-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
