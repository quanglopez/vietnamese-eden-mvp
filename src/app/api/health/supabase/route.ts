import { NextResponse } from "next/server";

import { runHealthCheckQuery } from "@/lib/supabase/health-check";

export async function GET() {
  try {
    const result = await runHealthCheckQuery();

    return NextResponse.json({
      status: "ok",
      supabase: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Supabase error";

    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 503 },
    );
  }
}
