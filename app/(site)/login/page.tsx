import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/actions/auth";
import { getCurrentProfile } from "@/lib/auth";
import { safeNextPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; error?: string }>;
}) {
  const { next: rawNext, reset, error } = await searchParams;
  const next = safeNextPath(rawNext);

  const profile = await getCurrentProfile();
  if (profile) redirect(next);

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]" />

      <div className="relative w-full max-w-md fade-up">
        <h1 className="text-center text-2xl font-bold text-navy-900">
          Тавтай морил
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Хяналтын самбартаа нэвтэрч, сургалтаа үргэлжлүүлээрэй.
        </p>

        {reset === "success" && (
          <p role="status" className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Нууц үг амжилттай солигдлоо. Шинэ нууц үгээрээ нэвтэрнэ үү.
          </p>
        )}
        {error === "link_expired" && (
          <p role="alert" className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
            Холбоосын хугацаа дууссан эсвэл аль хэдийн ашиглагдсан байна.{" "}
            <Link href="/forgot-password" className="font-semibold underline">
              Шинэ холбоос авах
            </Link>
          </p>
        )}

        <Card className="mt-8 shadow-md">
          <CardBody className="p-6 sm:p-7">
            <AuthForm mode="login" action={signIn} next={next} />
            <p className="mt-4 text-center text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-slate-500 hover:text-brand-600"
              >
                Нууц үгээ мартсан уу?
              </Link>
            </p>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Бүртгэлгүй юу?{" "}
          <Link
            href={next === "/dashboard" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-600 hover:text-brand-700">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
