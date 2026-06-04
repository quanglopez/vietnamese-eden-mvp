import { NextResponse } from "next/server";

import { getAiHealthStatus } from "@/lib/ai/health-check";
import { runHealthCheckQuery } from "@/lib/supabase/health-check";

export async function GET() {
  const timestamp = new Date().toISOString();
  const ai = getAiHealthStatus();

  try {
    const supabase = await runHealthCheckQuery();
    const ok = supabase.ok && ai.ok;

    return NextResponse.json(
      {
        ok,
        services: {
          app: { ok: true },
          supabase: { ok: supabase.ok },
          ai,
        },
        timestamp,
      },
      { status: ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        services: {
          app: { ok: true },
          supabase: { ok: false },
          ai,
        },
        timestamp,
      },
      { status: 503 },
    );
  }
}
