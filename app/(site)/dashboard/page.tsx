import { redirect } from "next/navigation";
import { Play } from "lucide-react";
import { CourseRow } from "@/components/course/CourseRow";
import { PremiumStatusCard } from "@/components/premium/PremiumStatusCard";
import { AvatarPicker } from "@/components/dashboard/AvatarPicker";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
import { NextStep, nextStepAction, nextStepFor } from "@/components/dashboard/NextStep";
import { Avatar } from "@/components/ui/Avatar";
import { StickyCta } from "@/components/ui/StickyCta";
import { getCurrentProfile } from "@/lib/auth";
import { getPublishedCourses } from "@/lib/data/courses";
import { getMyPaymentState } from "@/lib/data/payments";
import { isPremiumActive } from "@/lib/access";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const [courses, payment] = await Promise.all([
    getPublishedCourses(profile.id),
    getMyPaymentState(profile.id),
  ]);
  const firstName = profile.full_name?.trim().split(/\s+/)[0];
  const isAdmin = profile.role === "admin";
  const premium = isAdmin || isPremiumActive(profile);
  const pending = Boolean(payment.pending);

  const step = nextStepFor(courses, profile, pending);
  const action = nextStepAction(step);
  const watchedAny = courses.some((c) => c.completedLessons > 0);

  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center gap-4">
          <Avatar profile={profile} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
              {firstName ? `Сайн байна уу, ${firstName}` : "Сайн байна уу"}
            </h1>
            <p className="text-sm text-slate-600">
              {watchedAny ? "Орхисон газраасаа үргэлжлүүлээрэй." : "Эндээс сургалтаа эхлүүлнэ."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <NextStep step={step} />
          {!isAdmin && (
            <GettingStarted
              steps={[
                { label: "Бүртгүүлэх", done: true },
                { label: "Аватараа сонгох", done: Boolean(profile.avatar), href: "/dashboard/profile" },
                {
                  label: "Эхний хичээлээ үзэх",
                  done: watchedAny,
                  href: action?.href,
                },
                {
                  label: "Premium авах",
                  done: premium,
                  note: pending ? "Шалгагдаж байна" : undefined,
                  href: "/premium",
                },
              ]}
            />
          )}
        </div>

        {!profile.avatar && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold text-navy-900">Эхлээд аватараа сонгоорой</h2>
            <p className="mt-1 text-sm text-slate-500">
              Таны профайл болон асуулт дээр харагдана. Дараа нь хүссэн үедээ сольж болно.
            </p>
            <div className="mt-4">
              <AvatarPicker current={null} compact />
            </div>
          </section>
        )}

        {(premium || pending) && (
          <PremiumStatusCard
            profile={profile}
            pendingSince={payment.pending?.created_at ?? null}
            className="mt-6"
          />
        )}

        {courses.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-semibold text-navy-900">Бүх курс</h2>
            <div className="mt-4 space-y-5">
              {courses.map((course, i) => (
                <CourseRow key={course.id} course={course} index={i} profile={profile} />
              ))}
            </div>
          </>
        )}
      </div>

      {action && (
        <StickyCta
          href={action.href}
          label={action.label}
          hint={action.hint}
          icon={step.kind === "watch" ? <Play size={16} fill="currentColor" /> : undefined}
        />
      )}
    </div>
  );
}
