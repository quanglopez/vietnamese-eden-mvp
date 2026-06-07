import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const signingKey = process.env.INNGEST_SIGNING_KEY || "NOT_SET";
  const eventKey = process.env.INNGEST_EVENT_KEY ? "SET" : "NOT_SET";
  const apiUrl = process.env.INNGEST_API_URL || "NOT_SET";
  
  return NextResponse.json({
    signingKeyPrefix: signingKey.substring(0, 20),
    signingKeyLength: signingKey.length,
    signingKeySet: signingKey !== "NOT_SET",
    eventKeySet: eventKey === "SET",
    apiUrl,
    nodeEnv: process.env.NODE_ENV,
  });
}