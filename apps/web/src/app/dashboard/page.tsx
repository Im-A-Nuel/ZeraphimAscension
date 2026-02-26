import dynamic from "next/dynamic";

const DashboardView = dynamic(
  () => import("@/components/pages/(dashboard)").then((module) => module.DashboardView),
  {
    loading: () => <div className="px-6 py-8 text-sm text-muted">Loading dashboard...</div>,
  },
);

export default function DashboardPage() {
  return (
    <main className="bg-default text-default">
      <DashboardView />
    </main>
  );
}
