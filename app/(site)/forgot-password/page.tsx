import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Нууц үг сэргээх",
  robots: { index: false },
};

export default async function ForgotPasswordPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/70 px-4 py-16">

      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-navy-900">
          Нууц үгээ мартсан уу?
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Бүртгэлтэй и-мэйлээ оруулбал сэргээх холбоос илгээнэ.
        </p>

        <Card className="mt-8">
          <CardBody className="p-6 sm:p-7">
            <ForgotPasswordForm />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            ← Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
