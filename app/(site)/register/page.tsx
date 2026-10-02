import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/actions/auth";
import { getCurrentProfile } from "@/lib/auth";
import { safeNextPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Үнэгүй бүртгүүлэх",
  description:
    "Cargo Hub-д үнэгүй бүртгүүлж, карго бизнесийн үнэгүй хичээлүүдийг шууд үзэж эхлээрэй.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);

  const profile = await getCurrentProfile();
  if (profile) redirect(next);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/70 px-4 py-16">

      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-navy-900">
          Үнэгүй бүртгүүлэх
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Хэдхэн секундэд бүртгүүлж, сургалтаа эхлүүлээрэй.
        </p>

        <Card className="mt-8">
          <CardBody className="p-6 sm:p-7">
            <AuthForm
              mode="register"
              action={signUp}
              next={next}
            />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Бүртгэлтэй юу?{" "}
          <Link
            href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-700 hover:text-brand-800">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
