import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

function requireEnv(value: string | undefined, label: string): string {
  if (!value) {
    console.error(`❌ Missing ${label}`);
    process.exit(1);
  }
  return value;
}

const url = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);
const anonKey = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

const testEmail = `test-${Date.now()}@vietnamese-eden.local`;

async function main() {
  console.log("🔐 ALE-64 auth smoke test\n");

  const signupRes = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify({
      email: testEmail,
      password: "testpass123",
      data: { full_name: "Test User" },
      options: {
        emailRedirectTo: "http://127.0.0.1:3000/auth/callback?next=/dashboard",
      },
    }),
  });

  const signupBody = (await signupRes.json()) as {
    id?: string;
    error?: string;
    msg?: string;
  };

  if (!signupRes.ok) {
    throw new Error(signupBody.error ?? signupBody.msg ?? "Signup failed");
  }

  console.log("✅ Signup API OK — confirmation email queued");
  console.log(`   Email: ${testEmail}`);
  console.log("   Check Mailpit: http://127.0.0.1:54324");

  const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify({
      email: testEmail,
      password: "testpass123",
    }),
  });

  if (loginRes.status === 400) {
    console.log("✅ Unconfirmed user blocked from login (email confirmation ON)");
  } else if (loginRes.ok) {
    console.log("✅ Login OK (confirmations may be off)");
  } else {
    const loginBody = (await loginRes.json()) as { error?: string; msg?: string };
    console.log(`ℹ️  Login response: ${loginBody.error ?? loginBody.msg}`);
  }
}

main().catch((error: unknown) => {
  console.error("❌ Auth test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
