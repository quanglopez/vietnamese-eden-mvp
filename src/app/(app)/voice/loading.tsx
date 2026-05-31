import { AppShell } from "@/components/custom/app/app-shell";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function VoiceLoading() {
  return (
    <AppShell title="Giọng văn" subtitle="Đang tải…">
      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        <Pulse className="h-96" />
        <Pulse className="h-[480px]" />
      </div>
    </AppShell>
  );
}
