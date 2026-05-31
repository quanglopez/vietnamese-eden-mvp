/** UI-only mock data for dashboard preview — replace with Supabase in later issues. */

export type DashboardPost = {
  id: string;
  platform: "TikTok" | "Instagram" | "YouTube" | "Facebook" | "Threads";
  author: string;
  handle: string;
  hook: string;
  thumb: string;
  views: string;
  boardId: string;
};

export type DashboardBoard = {
  id: string;
  name: string;
  emoji: string;
  count: number;
  color: string;
};

export const dashboardBoards: DashboardBoard[] = [
  {
    id: "viral-hooks",
    name: "Hook viral 2026",
    emoji: "🪝",
    count: 42,
    color: "from-brand to-brand-2",
  },
  {
    id: "skincare",
    name: "Skincare cho Gen Z",
    emoji: "✨",
    count: 28,
    color: "from-brand-2 to-brand-3",
  },
  {
    id: "fnb",
    name: "F&B Sài Gòn",
    emoji: "🍜",
    count: 36,
    color: "from-brand-3 to-brand-4",
  },
  {
    id: "ecom",
    name: "E-commerce dropship",
    emoji: "📦",
    count: 19,
    color: "from-brand-4 to-brand",
  },
];

export const dashboardPosts: DashboardPost[] = [
  {
    id: "p1",
    platform: "TikTok",
    author: "Minh Trang",
    handle: "@trangbeauty",
    hook: "Mình đã bỏ 12 triệu mua skincare và đây là 3 sản phẩm DUY NHẤT đáng tiền…",
    thumb: "from-[#ff6b35] to-[#e84393]",
    views: "2.4M",
    boardId: "skincare",
  },
  {
    id: "p2",
    platform: "Instagram",
    author: "Quán Cô Ba",
    handle: "@quancoba.sg",
    hook: "Tô bún bò 35K ở quận 3 mà khách xếp hàng từ 6h sáng — bí mật nằm ở…",
    thumb: "from-[#f7931e] to-[#ff0050]",
    views: "890K",
    boardId: "fnb",
  },
  {
    id: "p3",
    platform: "YouTube",
    author: "Khoa Finance",
    handle: "@khoafinance",
    hook: "Nếu bạn 25 tuổi và chưa có 50 triệu tiết kiệm, hãy xem video này trước khi…",
    thumb: "from-[#ff0000] to-[#ff6b35]",
    views: "1.1M",
    boardId: "viral-hooks",
  },
  {
    id: "p4",
    platform: "TikTok",
    author: "Linh Dropship",
    handle: "@linhship",
    hook: "Sản phẩm 89K bán 4000 đơn/tuần — tôi chỉ làm đúng 1 thứ trong video này…",
    thumb: "from-[#00f2ea] to-[#1877f2]",
    views: "560K",
    boardId: "ecom",
  },
];
