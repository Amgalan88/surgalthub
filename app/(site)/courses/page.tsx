import Link from "next/link";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/course/CourseCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getPublishedCourses } from "@/lib/data/courses";
import { getCurrentProfile } from "@/lib/auth";
import { TRACK_LABELS, type CourseTrack } from "@/lib/types";

const filters: { key: CourseTrack | "all"; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "opening", label: TRACK_LABELS.opening },
  { key: "operating", label: TRACK_LABELS.operating },
  { key: "platform", label: TRACK_LABELS.platform },
];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const activeTrack = (
    ["opening", "operating", "platform"].includes(track ?? "")
      ? track
      : "all"
  ) as CourseTrack | "all";

  const profile = await getCurrentProfile();
  const courses = await getPublishedCourses(
    activeTrack === "all" ? undefined : activeTrack,
    profile?.id
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Reveal className="max-w-2xl">
        <h1 className="text-3xl font-bold text-navy-900">Сургалтууд</h1>
        <p className="mt-2 text-slate-500">
          Карго бизнесийн чиглэлээр бэлтгэсэн бүх курсын жагсаалт.
        </p>
      </Reveal>

      <Reveal
        delay={0.1}
        className="mt-8 flex flex-wrap gap-2"
        data-tour="track-filter"
      >
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/courses" : `/courses?track=${f.key}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
              activeTrack === f.key
                ? "bg-navy-900 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
            )}
          >
            {f.label}
          </Link>
        ))}
      </Reveal>

      {courses.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          Одоогоор энэ чиглэлд нийтлэгдсэн сургалт алга байна.
        </div>
      ) : (
        <Stagger
          key={activeTrack}
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerGap={0.08}
          data-tour="course-grid"
        >
          {courses.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard course={course} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
