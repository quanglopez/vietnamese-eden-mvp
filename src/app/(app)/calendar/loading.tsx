import { AppShell } from "@/components/custom/app/app-shell";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function CalendarLoading() {
  return (
    <AppShell title="Lịch nội dung" subtitle="Đang tải…">
      <div className="space-y-4">
        <Pulse className="h-10 w-64" />
        <Pulse className="h-32" />
        <Pulse className="h-32" />
      </div>
    </AppShell>
  );
}
