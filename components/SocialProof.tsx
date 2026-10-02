import { TESTIMONIALS } from "@/lib/testimonials";

/** Real learner quotes. Hidden until lib/testimonials.ts has some. */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-navy-900">
          Суралцагчдын сэтгэгдэл
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={`${t.name}-${t.role}`}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6"
            >
              <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-slate-100 pt-4">
                <p className="font-medium text-navy-900">{t.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
