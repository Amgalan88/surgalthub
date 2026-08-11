import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
