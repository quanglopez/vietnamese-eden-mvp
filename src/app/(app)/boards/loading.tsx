import { AppShell } from "@/components/custom/app/app-shell";

function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function BoardsLoading() {
  return (
    <AppShell title="Bảng cảm hứng" subtitle="Đang tải danh sách bảng…">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <PulseBlock className="h-11 flex-1 max-w-md" />
        <PulseBlock className="h-9 w-24" />
        <PulseBlock className="h-9 w-24" />
        <PulseBlock className="h-10 w-32 ml-auto" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <PulseBlock key={index} className="h-[220px] rounded-2xl" />
        ))}
      </div>
    </AppShell>
  );
}
