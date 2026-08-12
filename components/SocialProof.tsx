import { Quote, Users, CheckCircle2, BookOpen } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { TESTIMONIALS } from "@/lib/testimonials";
import type { PlatformStats } from "@/lib/data/engagement";

/**
 * Below this, the numbers work against us — "3 суралцагч" reads as nobody is
 * here. The section stays hidden until the platform has something to show.
 */
const MIN_LEARNERS_TO_SHOW = 10;

export function PlatformStatsBar({ stats }: { stats: PlatformStats }) {
  if (stats.learners < MIN_LEARNERS_TO_SHOW) return null;

  const items = [
    { icon: Users, value: stats.learners, label: "суралцагч" },
    { icon: CheckCircle2, value: stats.lessonsCompleted, label: "хичээл үзсэн" },
    { icon: BookOpen, value: stats.courses, label: "сургалт" },
  ];

  return (
    <Reveal className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-8 sm:px-6">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="text-center">
            <Icon size={18} className="mx-auto text-brand-600" />
            <p className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">
              {value.toLocaleString("mn-MN")}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-bold text-navy-900">
            Суралцагчид юу гэж хэлдэг вэ?
          </h2>
          <p className="mt-3 leading-relaxed text-slate-500">
            Сургалтыг дүүргээд бодит бизнесээ эхлүүлсэн хүмүүсийн сэтгэгдэл.
          </p>
        </Reveal>

        <Stagger
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerGap={0.08}
        >
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={`${t.name}-${t.role}`}>
              <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Quote size={22} className="text-brand-400" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-navy-900">{t.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
