import { createClient } from "@/lib/supabase/server";

export interface SmokeSnapshot {
  ingestion: {
    total: number;
    last24h: number;
    metadataOnly: number;
    transcriptOk: number;
    latest: Array<{ id: string; title: string; platform: string; created_at: string; source_quality: string | null }>;
  };
  breakdown: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    last24h: number;
    latest: Array<{ id: string; status: string; ai_model: string | null; updated_at: string }>;
  };
  publish: {
    total: number;
    scheduled: number;
    published: number;
    failed: number;
    last24h: number;
    latest: Array<{ id: string; platform: string; status: string; scheduled_at: string }>;
  };
  storage: {
    bucketName: string;
    fileCount: number;
    lastUpload: string | null;
  };
  errors: string[];
}

export async function getSmokeSnapshot(): Promise<SmokeSnapshot> {
  const supabase = createClient();
  const errors: string[] = [];

  // Ingestion
  const { count: ingestionTotal, error: e1 } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true });
  if (e1) errors.push(`Ingestion count: ${e1.message}`);

  const { data: latestIngestion, error: e2 } = await supabase
    .from("content_items")
    .select("id, title, platform, created_at, raw_content")
    .order("created_at", { ascending: false })
    .limit(10);
  if (e2) errors.push(`Latest ingestion: ${e2.message}`);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: ingestion24h, error: e3 } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo);
  if (e3) errors.push(`Ingestion 24h: ${e3.message}`);

  const metadataOnly = latestIngestion?.filter(
    (item) => item.raw_content?.includes("[Metadata tự động") ?? false
  ).length ?? 0;
  const transcriptOk = (latestIngestion?.length ?? 0) - metadataOnly;

  // Breakdown
  const { count: breakdownTotal, error: e4 } = await supabase
    .from("content_analyses")
    .select("*", { count: "exact", head: true });
  if (e4) errors.push(`Breakdown count: ${e4.message}`);

  const { count: breakdownCompleted } = await supabase
    .from("content_analyses")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");
  const { count: breakdownFailed } = await supabase
    .from("content_analyses")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");
  const { count: breakdownPending } = await supabase
    .from("content_analyses")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: latestBreakdown, error: e5 } = await supabase
    .from("content_analyses")
    .select("id, status, ai_model, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);
  if (e5) errors.push(`Latest breakdown: ${e5.message}`);

  const { count: breakdown24h } = await supabase
    .from("content_analyses")
    .select("*", { count: "exact", head: true })
    .gte("updated_at", twentyFourHoursAgo);

  // Publish (calendar)
  const { count: publishTotal, error: e6 } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true });
  if (e6) errors.push(`Publish count: ${e6.message}`);

  const { count: publishScheduled } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled");
  const { count: publishPublished } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  const { count: publishFailed } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");

  const { data: latestPublish, error: e7 } = await supabase
    .from("content_calendar_items")
    .select("id, platform, status, scheduled_at")
    .order("scheduled_at", { ascending: false })
    .limit(10);
  if (e7) errors.push(`Latest publish: ${e7.message}`);

  const { count: publish24h } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo);

  // Storage
  const { data: storageFiles, error: e8 } = await supabase.storage
    .from("calendar-media")
    .list();
  if (e8) errors.push(`Storage list: ${e8.message}`);

  const lastUpload = storageFiles?.length
    ? storageFiles
        .filter((f) => f.created_at)
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0]
        ?.created_at ?? null
    : null;

  return {
    ingestion: {
      total: ingestionTotal ?? 0,
      last24h: ingestion24h ?? 0,
      metadataOnly,
      transcriptOk,
      latest: (latestIngestion ?? []).map((i) => ({
        id: i.id,
        title: i.title,
        platform: i.platform,
        created_at: i.created_at,
        source_quality: i.raw_content?.includes("[Metadata tự động") ? "metadata_only" : "transcript",
      })),
    },
    breakdown: {
      total: breakdownTotal ?? 0,
      completed: breakdownCompleted ?? 0,
      failed: breakdownFailed ?? 0,
      pending: breakdownPending ?? 0,
      last24h: breakdown24h ?? 0,
      latest: (latestBreakdown ?? []).map((b) => ({
        id: b.id,
        status: b.status,
        ai_model: b.ai_model,
        updated_at: b.updated_at,
      })),
    },
    publish: {
      total: publishTotal ?? 0,
      scheduled: publishScheduled ?? 0,
      published: publishPublished ?? 0,
      failed: publishFailed ?? 0,
      last24h: publish24h ?? 0,
      latest: (latestPublish ?? []).map((p) => ({
        id: p.id,
        platform: p.platform,
        status: p.status,
        scheduled_at: p.scheduled_at,
      })),
    },
    storage: {
      bucketName: "calendar-media",
      fileCount: storageFiles?.length ?? 0,
      lastUpload,
    },
    errors,
  };
}
