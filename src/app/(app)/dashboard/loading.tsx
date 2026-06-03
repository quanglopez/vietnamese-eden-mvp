import { AppShell } from "@/components/custom/app/app-shell";

function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell title="Tổng quan" subtitle="Đang tải…">
      <PulseBlock className="h-32 rounded-2xl mb-8" />
      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <PulseBlock key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <PulseBlock className="h-48 rounded-2xl" />
    </AppShell>
  );
}
