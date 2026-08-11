import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCurrentProfile } from "@/lib/auth";
import { getDashboardCourses } from "@/lib/data/progress";
import { TRACK_LABELS } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const courses = await getDashboardCourses(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900">
        Сайн байна уу, {profile.full_name ?? "найз"}!
      </h1>
      <p className="mt-1 text-slate-500">Таны сургалтын явц</p>

      {courses.length === 0 ? (
        <Card className="mt-8">
          <CardBody className="flex flex-col items-center py-14 text-center">
            <BookOpen className="text-slate-300" size={40} />
            <p className="mt-4 text-slate-500">
              Та одоогоор ямар ч сургалтад бүртгүүлээгүй байна.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Сургалт харах
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(({ course, totalLessons, completedLessons }) => {
            const pct =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
            return (
              <Card key={course.id}>
                <CardBody>
                  <Badge tone="brand">{TRACK_LABELS[course.track]}</Badge>
                  <h3 className="mt-3 font-semibold text-navy-900">
                    {course.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Явц</span>
                    <span>
                      {completedLessons}/{totalLessons}
                    </span>
                  </div>
                  <ProgressBar value={pct} className="mt-1.5" />

                  <div className="mt-4">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="block flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                    >
                      {pct === 100 ? "Дахин үзэх" : "Үргэлжлүүлэх"}
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
