import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentProfile } from "@/lib/auth";

export default async function ResetPasswordPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/forgot-password");

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]" />

      <div className="relative w-full max-w-md fade-up">
        <h1 className="text-center text-2xl font-bold text-navy-900">
          Шинэ нууц үг тохируулах
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Шинэ нууц үгээ оруулж хадгална уу.
        </p>

        <Card className="mt-8 shadow-md">
          <CardBody className="p-6 sm:p-7">
            <ResetPasswordForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
