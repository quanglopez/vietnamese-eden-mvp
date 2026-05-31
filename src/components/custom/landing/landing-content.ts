export const PRICING_TIERS = [
  {
    id: "beta",
    name: "Free / Beta",
    price: "0đ",
    period: "trong giai đoạn beta",
    description: "Dành cho creator thử luồng MVP đầy đủ.",
    highlighted: true,
    cta: "Tham gia waitlist",
    ctaHref: "#waitlist",
    features: [
      "Swipe board không giới hạn",
      "AI Breakdown + Remix (mock hoặc OpenAI)",
      "1 voice profile",
      "Lịch nội dung 30 ngày",
      "Copy / export output",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "299.000đ",
    period: "/ tháng (sắp mở)",
    description: "Cho solo creator làm content hàng ngày.",
    highlighted: false,
    cta: "Đăng ký sớm",
    ctaHref: "#waitlist",
    features: [
      "Mọi tính năng Beta",
      "Nhiều voice profile",
      "Remix batch lớn hơn",
      "Ưu tiên queue AI",
      "Hỗ trợ email",
    ],
  },
  {
    id: "agency",
    name: "Pro / Agency",
    price: "Liên hệ",
    period: "theo workspace",
    description: "Cho agency quản nhiều brand và thành viên.",
    highlighted: false,
    cta: "Liên hệ beta",
    ctaHref: "#waitlist",
    features: [
      "Workspace đa thành viên",
      "Board theo client",
      "Voice profile theo brand",
      "Calendar team view",
      "Onboarding riêng",
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Vietnamese Eden khác gì so với lưu link trong Notes?",
    a: "Bạn lưu bài viral, phân tích hook/angle/CTA bằng AI, remix theo giọng viết riêng và đưa thẳng vào lịch — một workspace thay vì rời rạc nhiều app.",
  },
  {
    q: "Có cần OpenAI API key không?",
    a: "Beta có thể dùng chế độ mock (AI_USE_MOCK=true). Khi bật AI thật, bạn cấu hình OPENAI_API_KEY trên server.",
  },
  {
    q: "URL TikTok/Facebook có tự lấy nội dung không?",
    a: "Chưa — MVP lưu link và text thủ công. URL-only sẽ hiện thông báo rõ, không gọi AI cho đến khi có nội dung text.",
  },
  {
    q: "Có auto-post lên mạng xã hội không?",
    a: "Chưa. Calendar giúp lên kế hoạch và theo trạng thái; đăng bài vẫn thủ công.",
  },
  {
    q: "Khi nào mở billing?",
    a: "Sau beta. Gói Creator và Pro/Agency trên landing là định hướng giá, chưa thanh toán Stripe.",
  },
] as const;

export const CORE_FEATURES = [
  {
    title: "Swipe Board",
    description:
      "Lưu bài viral, swipe file và ý tưởng từ TikTok, Facebook, Instagram — gom một chỗ cho team.",
  },
  {
    title: "AI Breakdown",
    description:
      "Phân tích hook, angle, structure, CTA và insight — hiểu vì sao bài chạy tốt.",
  },
  {
    title: "Remix tiếng Việt",
    description:
      "Sinh 5–10 biến thể caption/script theo format và tone bạn chọn.",
  },
  {
    title: "Voice Profile",
    description:
      "Học giọng viết từ mẫu của bạn — remix nghe đúng “mình” hơn template chung.",
  },
  {
    title: "Content Calendar",
    description:
      "Đưa output đã remix vào lịch 30 ngày, theo kênh và trạng thái đăng.",
  },
  {
    title: "Copy & Export",
    description:
      "Copy nhanh hoặc tải .txt/.md — sẵn sàng dán lên tool đăng bài.",
  },
] as const;

export const USE_CASES = [
  {
    title: "Beauty / lifestyle creator",
    body: "Lưu hook viral ngành beauty, breakdown góc “skincare routine”, remix 7 caption cho tuần.",
  },
  {
    title: "Agency social nhỏ",
    body: "Mỗi client một board, voice profile riêng, calendar theo ngày đăng từng kênh.",
  },
  {
    title: "Educator / coach",
    body: "Swipe case study, tách structure bài dạy, remix thành thread và CTA workshop.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Lưu inspiration",
    body: "Tạo board, thêm text hoặc link bài viral bạn muốn học hỏi.",
  },
  {
    step: "2",
    title: "Phân tích AI",
    body: "Chạy Breakdown để thấy hook, angle, structure và CTA.",
  },
  {
    step: "3",
    title: "Remix + giọng văn",
    body: "Chọn format, tone, voice profile — sinh biến thể tiếng Việt.",
  },
  {
    step: "4",
    title: "Lên lịch đăng",
    body: "Đưa output vào calendar, copy/export và đăng thủ công.",
  },
] as const;
