import { serve } from "inngest/next";

import { inngest, functions } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
// 07 Thg6 2026  4:02:11 CH
