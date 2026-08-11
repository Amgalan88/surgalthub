import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentProfile } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]" />

      <div className="relative w-full max-w-md fade-up">
        <h1 className="text-center text-2xl font-bold text-navy-900">
          Нууц үгээ мартсан уу?
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Бүртгэлтэй и-мэйлээ оруулбал сэргээх холбоос илгээнэ.
        </p>

        <Card className="mt-8 shadow-md">
          <CardBody className="p-6 sm:p-7">
            <ForgotPasswordForm />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            ← Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
