import { redirect } from "next/navigation";
import { CourseRow } from "@/components/course/CourseRow";
import { PremiumStatusCard } from "@/components/premium/PremiumStatusCard";
import { getCurrentProfile } from "@/lib/auth";
import { getPublishedCourses } from "@/lib/data/courses";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const courses = await getPublishedCourses(profile.id);
  const firstName = profile.full_name?.trim().split(/\s+/)[0];

  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {firstName ? `Сайн байна уу, ${firstName}` : "Сайн байна уу"}
        </h1>
        <p className="mt-1 text-slate-600">
          Курсуудаа дарааллаар нь үзээрэй. Явц тань автоматаар хадгалагдана.
        </p>

        <PremiumStatusCard profile={profile} showLink className="mt-6" />

        {courses.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
            Хичээлүүд удахгүй нэмэгдэнэ.
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {courses.map((course, i) => (
              <CourseRow key={course.id} course={course} index={i} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
