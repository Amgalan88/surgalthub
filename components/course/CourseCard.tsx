import Link from "next/link";
import { ArrowRight, Crown, Rocket, Settings, Globe } from "lucide-react";
import { formatMNT } from "@/lib/access";
import { TRACK_LABELS, type Course, type CourseTrack } from "@/lib/types";

const trackConfig: Record<
  CourseTrack,
  { icon: typeof Rocket; gradFrom: string; gradTo: string; glow: string }
> = {
  opening: {
    icon: Rocket,
    gradFrom: "#172554",
    gradTo: "#1d4ed8",
    glow: "rgba(29,78,216,0.35)",
  },
  operating: {
    icon: Settings,
    gradFrom: "#172554",
    gradTo: "#0f766e",
    glow: "rgba(15,118,110,0.35)",
  },
  platform: {
    icon: Globe,
    gradFrom: "#172554",
    gradTo: "#b45309",
    glow: "rgba(180,83,9,0.35)",
  },
};

export function CourseCard({ course }: { course: Course }) {
  const isPaid = course.price > 0;
  const cfg = trackConfig[course.track];
  const Icon = cfg.icon;

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-slate-300 group-hover:shadow-[0_16px_40px_-12px_rgba(23,37,84,0.25)]">
        {/* Cover */}
        <div
          className="relative flex h-44 items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${cfg.gradFrom} 0%, ${cfg.gradTo} 100%)`,
          }}
        >
          {/* Radial brand glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(245,158,11,0.28),transparent_55%)] transition-opacity duration-300 group-hover:opacity-100" />

          {/* Decorative rings */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full border border-white/5 transition-transform duration-500 group-hover:scale-125" />

          {/* Icon */}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-300 ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={30} strokeWidth={1.75} />
          </span>

          {/* Price / free pill */}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur">
            {isPaid ? (
              <>
                <Crown size={11} className="text-brand-300" />
                {formatMNT(course.price)}
              </>
            ) : (
              "Үнэгүй"
            )}
          </span>

          {/* Track label */}
          <span className="absolute bottom-3 right-4 text-[11px] font-medium tracking-wide text-white/60">
            {TRACK_LABELS[course.track]}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold leading-snug text-navy-900 transition-colors duration-200 group-hover:text-brand-700">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
            {course.description}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              Дэлгэрэнгүй
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>
      </article>
    </Link>
  );
}
