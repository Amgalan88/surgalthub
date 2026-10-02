import type { Metadata } from "next";
import DashboardTabs from "@/components/layout/DashboardTabs";

export const metadata: Metadata = {
  title: "Хяналтын самбар",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <DashboardTabs />
      </div>
      {children}
    </div>
  );
}
