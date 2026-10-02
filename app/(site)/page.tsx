import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Lock, Play } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { CourseRow } from "@/components/course/CourseRow";
import { courseNumber, nextInCurriculum } from "@/components/course/courseLinks";
import { Faq } from "@/components/marketing/Faq";
import { Testimonials } from "@/components/SocialProof";
import { getPublishedCourses } from "@/lib/data/courses";
import { getCurrentProfile } from "@/lib/auth";
import {
  formatMNT,
  isPremiumActive,
  PREMIUM_DURATION_MONTHS,
  PREMIUM_PRICE_MNT,
} from "@/lib/access";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const courses = await getPublishedCourses(profile?.id);

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const freeLessons = courses.reduce((sum, c) => sum + c.freeLessonCount, 0);
  const up = nextInCurriculum(courses, profile);
  const firstAction = up ?? { href: "/courses", label: "Сургалтууд үзэх", locked: false };
  const hasPremium = profile?.role === "admin" || isPremiumActive(profile);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              Карго бизнесийн видео сургалт
            </p>
            <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-navy-900 sm:text-5xl">
              Карго хэрхэн ажилладгийг бодит жишээн дээр сур
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Захиалга авахаас эхлээд ачааг Эрээнээс Улаанбаатарт хүргэх,
              замд гарсан асуудлыг шийдэх хүртэл
              {totalLessons > 0 ? ` ${totalLessons} богино видео хичээлээр` : " богино видео хичээлээр"}{" "}
              алхам алхмаар үзүүлнэ.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={firstAction.href} size="lg">
                {firstAction.locked ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}
                {firstAction.label}
              </LinkButton>
              <LinkButton href="#curriculum" size="lg" variant="outline">
                Хөтөлбөр харах
              </LinkButton>
            </div>

            <ul className="mt-7 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:gap-6">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                Эхний хичээлүүдийг бүртгэлгүй үзнэ
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                Утас, компьютер дээр
              </li>
            </ul>
          </div>

          <Link
            href={firstAction.href}
            className="group relative block overflow-hidden rounded-xl bg-navy-900 shadow-[0_24px_60px_-24px_rgba(15,26,51,0.45)] ring-1 ring-navy-900/10"
          >
            <div className="relative aspect-video">
              <Image
                src={up?.course.cover_image ?? "/logo-banner.jpg"}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform group-hover:scale-105">
                <Play size={24} fill="currentColor" className="ml-1" />
              </span>
            </div>
            {up && (
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-xs font-medium text-white/75">
                  Курс {courseNumber(up.index)}
                  {up.lesson?.is_free_preview && !hasPremium ? " · Үнэгүй" : ""}
                </p>
                <p className="mt-0.5 truncate text-base font-semibold text-white">
                  {up.lesson?.title ?? up.course.title}
                </p>
              </div>
            )}
          </Link>
        </div>
      </section>

      {/* Facts */}
      {courses.length > 0 && (
        <section className="border-b border-slate-200">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
            {[
              { value: String(courses.length), label: "курс" },
              { value: String(totalLessons), label: "видео хичээл" },
              { value: String(freeLessons), label: "хичээл үнэгүй" },
              { value: `${PREMIUM_DURATION_MONTHS} сар`, label: "бүх хичээлд хандах" },
            ].map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse bg-white px-4 py-6 sm:px-6 md:py-8">
                <dt className="mt-1 text-sm text-slate-500">{fact.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-navy-900">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Curriculum */}
      <section id="curriculum" className="scroll-mt-20 bg-slate-50/70 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-navy-900">Хөтөлбөр</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Курсууд нэг нэгнийхээ үргэлжлэл. Дарааллаар нь үзвэл хамгийн
              ойлгомжтой.
            </p>
          </div>

          {courses.length === 0 ? (
            <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
              Хичээлүүд удахгүй нэмэгдэнэ.
            </p>
          ) : (
            <div className="mt-10 space-y-5">
              {courses.map((course, i) => (
                <CourseRow key={course.id} course={course} index={i} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900">Хэрхэн эхлэх вэ</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                title: "Үнэгүй хичээлээ үз",
                body: "Курс бүрийн эхний хичээлийг бүртгэл, төлбөргүйгээр шууд үзээд сургалт танд тохирох эсэхийг шалгаарай.",
              },
              {
                title: "Бүртгүүлж явцаа хадгал",
                body: "Үнэгүй бүртгүүлбэл аль хичээлийг үзсэнээ харж, дараа нь яг орхисон газраасаа үргэлжлүүлнэ.",
              },
              {
                title: "Premium-аар бүгдийг нээ",
                body: `${formatMNT(PREMIUM_PRICE_MNT)} нэг удаа төлөөд ${PREMIUM_DURATION_MONTHS} сарын турш бүх курсын бүх хичээлийг үзнэ.`,
              },
            ].map((step, i) => (
              <li key={step.title} className="border-t-2 border-navy-900 pt-5">
                <span className="text-sm font-medium tabular-nums text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900">Үнэ</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Сар бүрийн төлбөр, нууц нөхцөл байхгүй. Нэг удаа төлнө.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-navy-900">Үнэгүй</h3>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-navy-900">0₮</p>
              <ul className="mt-6 space-y-3 text-[15px] text-slate-600">
                {[
                  freeLessons > 0
                    ? `Курс бүрийн эхний хичээл, нийт ${freeLessons}`
                    : "Курс бүрийн эхний хичээл",
                  "Бүртгэлгүйгээр шууд үзнэ",
                  "Бүртгүүлбэл явц хадгалагдана",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <LinkButton href={firstAction.href} variant="outline" className="mt-8 w-full">
                {firstAction.label}
              </LinkButton>
            </div>

            <div className="relative rounded-xl border-2 border-brand-600 bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-navy-900">Premium</h3>
                <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-medium text-gold-700">
                  Бүх хичээл
                </span>
              </div>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-navy-900">
                  {formatMNT(PREMIUM_PRICE_MNT)}
                </span>
                <span className="text-slate-500">/ {PREMIUM_DURATION_MONTHS} сар</span>
              </p>
              <ul className="mt-6 space-y-3 text-[15px] text-slate-600">
                {[
                  courses.length > 0
                    ? `${courses.length} курсын бүх ${totalLessons} хичээл`
                    : "Бүх курсын бүх хичээл",
                  "Хичээл бүр дээр багшаас асуулт асуух",
                  `${PREMIUM_DURATION_MONTHS} сарын турш хэдэн ч удаа үзнэ`,
                  "Үзэж дуусгасан хичээл хугацааны дараа ч нээлттэй",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <LinkButton href="/premium" className="mt-8 w-full">
                {hasPremium ? "Миний эрх" : "Premium авах"}
                <ArrowRight size={16} />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy-900">
              Түгээмэл асуулт
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Хариултаа олоогүй бол хичээлийн доор асуултаа үлдээгээрэй.
            </p>
          </div>
          <Faq />
        </div>
      </section>
    </div>
  );
}
