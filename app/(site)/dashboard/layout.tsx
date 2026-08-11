import DashboardTabs from "@/components/layout/DashboardTabs";

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
