import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentProfile } from "@/lib/auth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <>
      <Navbar profile={profile} />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
