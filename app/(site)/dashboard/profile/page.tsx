import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { AvatarPicker } from "@/components/dashboard/AvatarPicker";
import { Avatar } from "@/components/ui/Avatar";
import { getCurrentProfile } from "@/lib/auth";
import { formatPremiumDate, isPremiumActive } from "@/lib/access";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  const premium = isPremiumActive(profile);

  return (
    <div className="bg-slate-50/70">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <section className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6">
          <Avatar profile={profile} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-navy-900">
              {profile.full_name || "Нэрээ оруулна уу"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{profile.phone || "Утас оруулаагүй"}</p>
            <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {profile.role === "admin"
                ? "Админ"
                : premium && profile.premium_until
                  ? `Premium · ${formatPremiumDate(profile.premium_until)} хүртэл`
                  : "Үнэгүй хэрэглэгч"}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-navy-900">Аватараа сонгоорой</h2>
          <p className="mt-1 text-sm text-slate-500">
            Дуртай амьтнаа сонгоход шууд хадгалагдана.
          </p>
          <div className="mt-5">
            <AvatarPicker current={profile.avatar ?? null} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-navy-900">Хувийн мэдээлэл</h2>
          <p className="mt-1 text-sm text-slate-500">
            Утасны дугаараа зөв оруулаарай. Төлбөр шилжүүлэхэд гүйлгээний утга болно.
          </p>
          <div className="mt-5">
            <ProfileForm profile={profile} />
          </div>
        </section>
      </div>
    </div>
  );
}
