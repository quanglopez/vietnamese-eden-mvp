import { AppShell } from "@/components/custom/app/app-shell";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function RemixItemLoading() {
  return (
    <AppShell title="Remix Generator" subtitle="Đang tải…">
      <Pulse className="h-4 w-40 mb-6" />
      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        <Pulse className="h-72" />
        <div className="space-y-4">
          <Pulse className="h-8 w-48" />
          <Pulse className="h-40" />
          <Pulse className="h-40" />
        </div>
      </div>
    </AppShell>
  );
}
