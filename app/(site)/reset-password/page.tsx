import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Шинэ нууц үг",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/forgot-password");

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/70 px-4 py-16">

      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-navy-900">
          Шинэ нууц үг тохируулах
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Шинэ нууц үгээ оруулж хадгална уу.
        </p>

        <Card className="mt-8">
          <CardBody className="p-6 sm:p-7">
            <ResetPasswordForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
