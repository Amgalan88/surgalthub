import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TRACK_LABELS, type Course } from "@/lib/types";

const trackTone = {
  opening: "brand",
  operating: "navy",
  platform: "green",
} as const;

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <div className="flex h-32 items-center justify-center rounded-t-xl bg-gradient-to-br from-navy-900 to-navy-700 text-white">
          <span className="text-sm font-semibold tracking-wide opacity-90">
            {TRACK_LABELS[course.track]}
          </span>
        </div>
        <CardBody>
          <Badge tone={trackTone[course.track]}>{TRACK_LABELS[course.track]}</Badge>
          <h3 className="mt-3 text-lg font-semibold text-navy-900">
            {course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {course.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
            Дэлгэрэнгүй <ArrowRight size={15} />
          </span>
        </CardBody>
      </Card>
    </Link>
  );
}
