import { AppShell } from "@/components/custom/app/app-shell";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function BreakdownLoading() {
  return (
    <AppShell title="AI Breakdown" subtitle="Đang tải…">
      <Pulse className="h-4 w-32 mb-6" />
      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        <Pulse className="aspect-[3/4]" />
        <div className="space-y-4">
          <Pulse className="h-24" />
          <Pulse className="h-40" />
          <Pulse className="h-40" />
        </div>
      </div>
    </AppShell>
  );
}
