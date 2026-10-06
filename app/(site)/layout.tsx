import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentProfile } from "@/lib/auth";
import { getPendingPaymentCount } from "@/lib/data/payments";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  // Admins browsing the site still need to notice a learner waiting on them.
  const pendingPayments =
    profile?.role === "admin" ? await getPendingPaymentCount() : 0;

  return (
    <>
      <Navbar profile={profile} pendingPayments={pendingPayments} />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
