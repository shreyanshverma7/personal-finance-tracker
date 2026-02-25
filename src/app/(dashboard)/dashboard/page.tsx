import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold border-l-4 border-l-primary pl-3">Dashboard</h1>
      <DashboardContent />
    </div>
  );
}
