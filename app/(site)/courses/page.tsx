import type { Metadata } from "next";
import { CourseRow } from "@/components/course/CourseRow";
import { getPublishedCourses } from "@/lib/data/courses";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Сургалтууд",
  description:
    "Карго хэрхэн ажилладаг, үндсэн ойлголтууд, түгээмэл асуудлын шийдэл — бүх видео курс. Курс бүрийн эхний хичээл үнэгүй.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const profile = await getCurrentProfile();
  const courses = await getPublishedCourses(profile?.id);
  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);

  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Сургалтууд
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {courses.length > 0
              ? `${courses.length} курс, нийт ${totalLessons} видео хичээл. Курсууд нэг нэгнийхээ үргэлжлэл тул дарааллаар нь үзэхийг зөвлөж байна.`
              : "Курсууд удахгүй нэмэгдэнэ."}
          </p>
        </div>

        {courses.length > 0 && (
          <div className="mt-10 space-y-5">
            {courses.map((course, i) => (
              <CourseRow key={course.id} course={course} index={i} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
