import Link from "next/link";
import {
  Rocket,
  Settings,
  Globe,
  ListChecks,
  Smartphone,
  TrendingUp,
  Users,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { CourseCard } from "@/components/course/CourseCard";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Reveal, Stagger, StaggerItem, TiltCard } from "@/components/motion";
import { PlatformStatsBar, Testimonials } from "@/components/SocialProof";
import { getPublishedCourses } from "@/lib/data/courses";
import { getPlatformStats } from "@/lib/data/engagement";
import { getCurrentProfile } from "@/lib/auth";
import type { CourseTrack } from "@/lib/types";

const tracks: {
  key: CourseTrack;
  title: string;
  description: string;
  icon: LucideIcon;
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
    title: "Туршлагатай багш нар",
    description:
      "Карго бизнесийг жилүүдийн турш амжилттай ажиллуулсан мэргэжилтнүүдийн гарын авлага.",
    icon: Users,
  },
  {
    title: "Хаанаас ч, ямар ч төхөөрөмжөөс",
    description: "Гар утас, компьютер дээр тохирсон, хурдан, энгийн интерфейс.",
    icon: Smartphone,
  },
  {
    title: "Явцын хяналт",
    description:
      "Хичээл бүрийн ахицаа хянаж, өөрийн хэмнэлээр, өөрийн цагт суралцана.",
    icon: TrendingUp,
  },
];

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const [allCourses, stats] = await Promise.all([
    getPublishedCourses(undefined, profile?.id),
    getPlatformStats(),
  ]);
  const featured = allCourses.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgba(245,158,11,0.14),transparent_65%)]" />
        <HeroCanvas />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="max-w-2xl">
            <Reveal delay={0.05}>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200 ring-1 ring-inset ring-white/20 backdrop-blur">
                Монголын анхны карго бизнесийн сургалтын платформ
              </span>
            </Reveal>
            <Reveal delay={0.15}>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Карго бизнесээ нээх, ажиллуулах, өсгөхийг{" "}
                <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
                  практикаар
                </span>{" "}
                сур
              </h1>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">
                Карго нээх, ажиллуулах, онлайн платформ ашиглах чиглэлээр
                бэлтгэсэн хичээлүүд нь таны цаг хугацааг хэмнэж, танд
                эргэлзээгүй ажиллах боломжийг олгоно.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton
                  href="/courses"
                  size="lg"
                  data-tour="hero-cta"
                  className="shadow-[0_4px_24px_rgba(217,119,6,0.45)]"
                >
                  Сургалт үзэх <ArrowRight size={18} />
                </LinkButton>
                <LinkButton
                  href="/register"
                  size="lg"
                  variant="outline"
                  className="bg-white/5 text-white border-white/30 hover:bg-white/10"
                >
                  Үнэгүй бүртгүүлэх
                </LinkButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <PlatformStatsBar stats={stats} />

      {/* Tracks */}
      <section
        id="tracks"
        data-tour="tracks-section"
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
      >
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-navy-900">3 үндсэн чиглэл</h2>
          <p className="mt-3 text-slate-500">
            Карго бизнесийн аяллын шат бүрт зориулсан тусгайлсан сургалтын
            гарц.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-3">
          {tracks.map((t) => (
            <StaggerItem key={t.key}>
              <TiltCard max={5} className="h-full">
                <Link
                  href={`/courses?track=${t.key}`}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-100/60"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
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
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Advantages */}
      <section id="advantages" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Бидний давуу тал
            </h2>
            <p className="mt-3 text-slate-500">
              Cargo Hub-ыг өөр сургалтуудаас ялгаж буй онцлогууд.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerGap={0.09}>
            {advantages.map((a) => (
              <StaggerItem key={a.title}>
                <div className="h-full rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-brand-400">
                    <a.icon size={20} />
                  </span>
                  <h3 className="mt-4 font-semibold text-navy-900">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {a.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-navy-900">
              Онцлох сургалтууд
            </h2>
            <Link
              href="/courses"
              className="hidden text-sm font-medium text-brand-600 sm:inline-flex items-center gap-1"
            >
              Бүгдийг үзэх <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerGap={0.1}>
            {featured.map((course) => (
              <StaggerItem key={course.id}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <Testimonials />

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-bold text-white">
              Өнөөдрөөс карго бизнесээ эхлүүлээрэй
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Үнэгүй бүртгүүлж, эхний хичээлээ шууд эхлүүлээрэй.
            </p>
            <div className="mt-7">
              <LinkButton
                href="/register"
                size="lg"
                data-tour="register-cta"
                className="shadow-[0_4px_24px_rgba(217,119,6,0.45)]"
              >
                Үнэгүй бүртгүүлэх
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
