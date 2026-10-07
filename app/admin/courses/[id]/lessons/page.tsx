import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Eye, EyeOff, Settings } from "lucide-react";
import { LessonManager } from "@/components/admin/LessonManager";
import { getCourseByIdAdmin } from "@/lib/data/admin";
import { getLessonsForCourse } from "@/lib/data/courses";
import { toggleCoursePublished } from "@/lib/actions/admin/courses";

export default async function AdminLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  const lessons = await getLessonsForCourse(id);
  const missingVideo = lessons.filter((l) => !l.video_url).length;
  const freeCount = lessons.filter((l) => l.is_free_preview).length;
  const togglePublished = toggleCoursePublished.bind(null, id, !course.published);

  return (
    <div className="max-w-5xl p-6 sm:p-8">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900"
      >
        <ChevronLeft size={15} /> Бүх курс
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {lessons.length} хичээл · {freeCount} нь үнэгүй
            {missingVideo > 0 && <span className="text-red-600"> · {missingVideo} нь видеогүй</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={togglePublished}>
            <button
              type="submit"
              className={
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium " +
                (course.published
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
                  : "bg-navy-900 text-white hover:bg-navy-800")
              }
              title={course.published ? "Дарвал сайтаас нуугдана" : "Дарвал сайт дээр гарна"}
            >
              {course.published ? <Eye size={15} /> : <EyeOff size={15} />}
              {course.published ? "Сайт дээр харагдаж байна" : "Нийтлэх"}
            </button>
          </form>
          {course.published && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink size={15} /> Үзэх
            </Link>
          )}
          <Link
            href={`/admin/courses/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Settings size={15} /> Курсын мэдээлэл
          </Link>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Нэр дээр дарж засна. Үнэгүй/Premium-ийг товчоор сэлгэнэ. Бүх өөрчлөлт шууд хадгалагдана.
      </p>

      <div className="mt-3">
        <LessonManager
          courseId={id}
          courseSlug={course.slug}
          lessons={lessons.map(({ id, title, is_free_preview, video_url }) => ({
            id,
            title,
            is_free_preview,
            video_url,
          }))}
        />
      </div>
    </div>
  );
}
