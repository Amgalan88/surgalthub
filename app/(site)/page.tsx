import Link from "next/link";
import {
  Rocket,
  Settings,
  Globe,
  Award,
  BarChart3,
  Smartphone,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { CourseCard } from "@/components/course/CourseCard";
import { getPublishedCourses } from "@/lib/data/courses";
import type { CourseTrack } from "@/lib/types";

const tracks: {
  key: CourseTrack;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "opening",
    title: "Карго нээх",
    description:
      "Бизнес бүртгэл, гаалийн бичиг баримт, агуулах сонголт зэрэг карго компани нээхэд шаардлагатай алхам бүрийг сурна.",
    icon: Rocket,
  },
  {
    key: "operating",
    title: "Карго ажиллуулах",
    description:
      "Тээвэр зохион байгуулалт, агуулахын менежмент, харилцагчийн үйлчилгээ, өдөр тутмын үйл ажиллагааг удирдах арга барил.",
    icon: Settings,
  },
  {
    key: "platform",
    title: "Карго вэбсайт ашиглах",
    description:
      "Онлайн карго платформ дээр захиалга үүсгэх, ачаа хянах, төлбөр тооцоо хийх зэрэг практик ур чадвар.",
    icon: Globe,
  },
];

const advantages = [
  {
    title: "Практик, алхам алхмаар",
    description:
      "Онолын оронд бодит чеклист, загвар маягт бүхий хичээлүүд — шууд ажил дээрээ хэрэгжүүлнэ.",
    icon: ListChecks,
  },
  {
    title: "Гэрчилгээтэй төгсөх",
    description:
      "Курс болон шалгалтаа амжилттай давбал автоматаар PDF гэрчилгээ авна.",
    icon: Award,
  },
  {
    title: "Хаанаас ч, ямар ч төхөөрөмжөөс",
    description: "Гар утас, компьютер дээр тохирсон, хурдан, энгийн интерфейс.",
    icon: Smartphone,
  },
  {
    title: "Явцын хяналт",
    description:
      "Хичээл бүрийн ахиц, шалгалтын дүн, гэрчилгээгээ нэг дороос хянана.",
    icon: BarChart3,
  },
];

export default async function HomePage() {
  const featured = (await getPublishedCourses()).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.2),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <div className="flex">
              <Logo size="lg" banner />
            </div>
            <span className="mt-5 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200 ring-1 ring-inset ring-white/20">
              Монголын анхны карго бизнесийн сургалтын платформ
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Карго бизнесээ нээх, ажиллуулах, өсгөхийг{" "}
              <span className="text-brand-500">практикаар</span> сур
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              Карго нээх, ажиллуулах, онлайн платформ ашиглах чиглэлээр
              бэлтгэсэн курсуудаараа шинэ бизнес эрхлэгчдэд бодит мэдлэг,
              гэрчилгээ олгоно.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/courses" size="lg">
                Сургалт үзэх <ArrowRight size={18} />
              </LinkButton>
              <LinkButton href="/register" size="lg" variant="outline" className="bg-white/5 text-white border-white/30 hover:bg-white/10">
                Үнэгүй бүртгүүлэх
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-navy-900">3 үндсэн чиглэл</h2>
          <p className="mt-3 text-slate-500">
            Карго бизнесийн аяллын шат бүрт зориулсан тусгайлсан сургалтын
            гарц.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {tracks.map((t) => (
            <Link
              key={t.key}
              href={`/courses?track=${t.key}`}
              className="group rounded-2xl border border-slate-200 p-6 transition-all hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <t.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                Курсууд харах
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section id="advantages" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Бидний давуу тал
            </h2>
            <p className="mt-3 text-slate-500">
              Cargo Hub-ыг өөр сургалтуудаас ялгаж буй онцлогууд.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <a.icon size={20} />
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-navy-900">
              Онцлох сургалтууд
            </h2>
            <Link
              href="/courses"
              className="hidden text-sm font-medium text-brand-600 sm:inline-flex items-center gap-1"
            >
              Бүгдийг үзэх <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">
            Өнөөдрөөс карго бизнесээ эхлүүлээрэй
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Үнэгүй бүртгүүлж, эхний хичээлээ шууд эхлүүлээрэй.
          </p>
          <div className="mt-7">
            <LinkButton
              href="/register"
              size="lg"
              variant="secondary"
              className="bg-white text-brand-700 hover:bg-brand-50"
            >
              Үнэгүй бүртгүүлэх
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
