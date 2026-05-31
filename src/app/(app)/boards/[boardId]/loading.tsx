import { AppShell } from "@/components/custom/app/app-shell";

function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function BoardDetailLoading() {
  return (
    <AppShell title="Đang tải bảng…" subtitle="Vui lòng chờ trong giây lát">
      <PulseBlock className="h-48 rounded-3xl mb-8" />
      <div className="flex gap-2 mb-6">
        <PulseBlock className="h-9 w-32" />
        <PulseBlock className="h-9 w-24" />
        <PulseBlock className="h-9 w-24" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <PulseBlock key={index} className="h-[320px] rounded-2xl" />
        ))}
      </div>
    </AppShell>
  );
}
