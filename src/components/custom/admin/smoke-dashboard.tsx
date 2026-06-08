import { CheckCircle2, AlertCircle, Clock, Database, HardDrive, Activity } from "lucide-react";
import type { SmokeSnapshot } from "@/lib/admin/smoke-queries";

export function SmokeDashboard({ snapshot }: { snapshot: SmokeSnapshot }) {
  const statusCards = [
    {
      label: "Ingestion 24h",
      value: snapshot.ingestion.last24h,
      detail: `${snapshot.ingestion.transcriptOk} transcript · ${snapshot.ingestion.metadataOnly} metadata-only`,
      icon: Database,
      status: snapshot.ingestion.last24h > 0 ? "ok" : "warn",
    },
    {
      label: "Breakdown 24h",
      value: snapshot.breakdown.last24h,
      detail: `${snapshot.breakdown.completed} done · ${snapshot.breakdown.failed} failed · ${snapshot.breakdown.pending} pending`,
      icon: Activity,
      status: snapshot.breakdown.completed > 0 ? "ok" : snapshot.breakdown.pending > 0 ? "warn" : "idle",
    },
    {
      label: "Publish 24h",
      value: snapshot.publish.last24h,
      detail: `${snapshot.publish.published} published · ${snapshot.publish.failed} failed`,
      icon: CheckCircle2,
      status: snapshot.publish.published > 0 ? "ok" : snapshot.publish.scheduled > 0 ? "warn" : "idle",
    },
    {
      label: "Storage",
      value: snapshot.storage.fileCount,
      detail: snapshot.storage.lastUpload
        ? `Last: ${new Date(snapshot.storage.lastUpload).toLocaleString("vi-VN")}`
        : "No files",
      icon: HardDrive,
      status: snapshot.storage.fileCount > 0 ? "ok" : "idle",
    },
  ];

  const bgByStatus: Record<string, string> = {
    ok: "bg-green-500/10 border-green-500/30",
    warn: "bg-amber-500/10 border-amber-500/30",
    idle: "bg-muted/30 border-border/30",
  };

  const textByStatus: Record<string, string> = {
    ok: "text-green-600 dark:text-green-400",
    warn: "text-amber-600 dark:text-amber-400",
    idle: "text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 space-y-2 ${bgByStatus[card.status]}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${textByStatus[card.status]}`} />
                <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              </div>
              <p className={`text-3xl font-display font-bold ${textByStatus[card.status]}`}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion */}
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-brand" />
            Ingestion mới nhất
          </h3>
          {snapshot.ingestion.latest.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {snapshot.ingestion.latest.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[180px] font-medium">{item.title}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{item.platform}</span>
                  <span
                    className={`shrink-0 ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.source_quality === "transcript"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {item.source_quality === "transcript" ? "transcript" : "metadata"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu.</p>
          )}
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" />
            Breakdown mới nhất
          </h3>
          {snapshot.breakdown.latest.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {snapshot.breakdown.latest.slice(0, 10).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[160px] font-medium">{b.id.slice(0, 8)}...</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{b.ai_model ?? "—"}</span>
                  <span
                    className={`shrink-0 ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      b.status === "completed"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : b.status === "failed"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu.</p>
          )}
        </div>

        {/* Publish */}
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            Publish mới nhất
          </h3>
          {snapshot.publish.latest.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {snapshot.publish.latest.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[120px] font-medium">{p.platform}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {new Date(p.scheduled_at).toLocaleDateString("vi-VN")}
                  </span>
                  <span
                    className={`shrink-0 ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      p.status === "published"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : p.status === "failed"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>

      {/* Errors */}
      {snapshot.errors.length > 0 ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Lỗi queries ({snapshot.errors.length})
          </h3>
          <ul className="space-y-1">
            {snapshot.errors.map((err, idx) => (
              <li key={idx} className="text-xs text-red-600 dark:text-red-400 font-mono">
                {err}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Auto-refresh: reload trang để cập nhật</span>
      </div>
    </div>
  );
}
