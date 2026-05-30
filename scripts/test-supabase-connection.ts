import { config } from "dotenv";
import { resolve } from "node:path";

import { runHealthCheckQuery } from "../src/lib/supabase/health-check";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🔌 Kiểm tra kết nối Supabase...\n");

  const result = await runHealthCheckQuery();

  console.log("✅ Test query thành công");
  console.log(`   Rows returned: ${result.rowCount}`);
  console.log(`   Checked at:    ${result.checkedAt}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ Supabase test failed:", message);
  process.exit(1);
});
