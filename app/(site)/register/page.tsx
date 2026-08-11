import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/actions/auth";
import { getCurrentProfile } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile) redirect("/dashboard");

  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-navy-900">
        Үнэгүй бүртгүүлэх
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Хэдхэн секундэд бүртгүүлж, сургалтаа эхлүүлээрэй.
      </p>

      <Card className="mt-8">
        <CardBody>
          <AuthForm
            mode="register"
            action={signUp}
            next={next ?? "/dashboard"}
          />
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-500">
        Бүртгэлтэй юу?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Нэвтрэх
        </Link>
      </p>
    </div>
  );
}
