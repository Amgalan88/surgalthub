import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { getCurrentProfile } from "@/lib/auth";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900">Профайл</h1>
      <Card className="mt-8 max-w-md">
        <CardBody>
          <ProfileForm profile={profile} />
        </CardBody>
      </Card>
    </div>
  );
}
