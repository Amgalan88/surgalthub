import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { getCurrentProfile } from "@/lib/auth";
import { getPendingPaymentCount } from "@/lib/data/payments";

export const metadata: Metadata = {
  title: { default: "Админ", template: "%s | Админ | Cargo Hub" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/dashboard");

  const pendingPayments = await getPendingPaymentCount();

  return <AdminShell pendingPayments={pendingPayments}>{children}</AdminShell>;
}
