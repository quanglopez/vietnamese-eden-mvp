// ALE-138: Seed demo data — 5 boards, 20 content items, 3 voice profiles
// Run: node --env-file=.env.local scripts/seed-demo-data.mjs
// Uses service role key — bypasses RLS. LOCAL ONLY.

import { readFileSync } from "fs";

// Load .env.local manually to avoid --env-file truncation issues
const envLines = readFileSync(".env.local", "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL = env.SEED_DEMO_EMAIL ?? "ggonevn@gmail.com";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Prefer: "return=representation",
};

async function rpc(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${text}`);
  return JSON.parse(text);
}

async function query(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { "Content-Type": "application/json", apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${text}`);
  return JSON.parse(text);
}

// 1. Get demo user from auth
const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(DEMO_EMAIL)}`, {
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
});
const authData = await authRes.json();
if (!authRes.ok || !authData.users?.length) { console.error("Demo user not found:", DEMO_EMAIL, authData); process.exit(1); }
const userId = authData.users[0].id;

// 2. Get workspace
const members = await query(`workspace_members?user_id=eq.${userId}&select=workspace_id&order=joined_at.asc&limit=1`);
if (!members.length) { console.error("No workspace for user"); process.exit(1); }
const workspaceId = members[0].workspace_id;
console.log(`User: ${userId} | Workspace: ${workspaceId}`);

// Guard: skip if already seeded (check boards count)
const existing = await query(`boards?workspace_id=eq.${workspaceId}&select=id`);
if (existing.length >= 5) { console.log("Already seeded — skipping."); process.exit(0); }

// 3. Insert 5 boards
const BOARDS = [
  { name: "Hook 2026", description: "Các hook viral thu hút chú ý", color: "from-violet-500 to-purple-600" },
  { name: "Tài chính cá nhân", description: "Content tài chính, tiết kiệm, đầu tư", color: "from-emerald-500 to-teal-600" },
  { name: "Lifestyle & Sức khỏe", description: "Thói quen, sức khỏe, năng lượng", color: "from-pink-500 to-rose-600" },
  { name: "Creator Tips", description: "Mẹo cho content creator", color: "from-amber-500 to-orange-600" },
  { name: "Skincare & Beauty", description: "Làm đẹp, dưỡng da, review sản phẩm", color: "from-sky-500 to-blue-600" },
];

const boards = await rpc("boards", BOARDS.map((b, i) => ({ ...b, workspace_id: workspaceId, sort_order: i, created_by: userId })));
console.log(`✅ ${boards.length} boards created`);

// 4. Insert 20 content items (4 per board)
const PLATFORMS = ["tiktok", "instagram", "facebook", "youtube", "other"];
const RAW = [
  "Hook mạnh mở đầu video: 'Bạn đang mắc sai lầm này mỗi ngày mà không biết...' — dừng scroll ngay lập tức.",
  "3 bước đơn giản thay đổi tài chính: 1) Ghi chi tiêu 30 ngày 2) Cắt 1 thói quen tốn tiền 3) Tự động chuyển 10% vào tiết kiệm.",
  "Buổi sáng không nhìn điện thoại 30 phút đầu = tăng focus cả ngày. Thử 7 ngày và cảm nhận sự khác biệt.",
  "Storytelling formula cho creator: Vấn đề → Hành trình → Giải pháp → Kết quả. Áp dụng cho mọi loại content.",
  "Skincare 2 phút buổi tối: rửa mặt + kem dưỡng ẩm + retinol. Đừng phức tạp hóa.",
];

const items = [];
for (let i = 0; i < 20; i++) {
  items.push({
    workspace_id: workspaceId,
    title: `Demo content #${i + 1} — ${BOARDS[i % 5].name}`,
    platform: PLATFORMS[i % 5],
    raw_content: RAW[i % RAW.length],
    author_name: "Demo Author",
    saved_by: userId,
  });
}
const contentItems = await rpc("content_items", items);
console.log(`✅ ${contentItems.length} content items created`);

// 5. Link items to boards (4 per board)
const links = contentItems.map((item, i) => ({
  board_id: boards[i % 5].id,
  content_item_id: item.id,
  sort_order: Math.floor(i / 5),
  added_by: userId,
}));
await rpc("board_content_items", links);
console.log(`✅ ${links.length} board-content links created`);

// 6. Insert 3 voice profiles
const VOICES = [
  { name: "Thân thiện & Gần gũi", tone: "casual", is_default: true },
  { name: "Chuyên nghiệp & Uy tín", tone: "professional", is_default: false },
  { name: "Năng động & Trẻ trung", tone: "energetic", is_default: false },
];
const voiceRows = VOICES.map(v => ({ ...v, workspace_id: workspaceId, user_id: userId, sample_count: 0 }));
const voices = await rpc("voice_profiles", voiceRows);
console.log(`✅ ${voices.length} voice profiles created`);

console.log("\n🎉 Seed complete!");
