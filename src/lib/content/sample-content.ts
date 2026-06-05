export interface SampleContent {
  title: string;
  rawContent: string;
  platform: string;
  niche: string;
}

// 2-3 realistic Vietnamese viral content samples for beta testers
// Safe, generic, no copyrighted source text
export const SAMPLE_CONTENTS: SampleContent[] = [
  {
    title: "Skincare routine tiết kiệm cho dân văn phòng",
    niche: "skincare/beauty",
    platform: "tiktok",
    rawContent: `Bạn nghĩ skincare phải mua hàng trăm triệu mới hiệu quả? 🤔

Sai lầm lớn nhất: mua nhiều bước, dụng cụ mà không hiểu da mình cần gì.

💡 3 bước cốt lõi cho dân văn phòng bận rộn:
1️⃣ Sữa rửa mặt nhẹ nhàng (sáng + tối) - loại bỏ bụi bẩn, dầu thừa
2️⃣ Kem dưỡng ẩm có SPF 30+ (buổi sáng) - chống nắng LÀ dưỡng da
3️⃣ Serum vitamin C hoặc niacinamide (tối) - sáng da, se khít lỗ chân lông

💰 Chi phí: ~500k-1tr/tháng cho set cơ bản
⏱️ Thời gian: 2 phút sáng, 3 phút tối

Mẹo: Đừng đổi sản phẩm liên tục. Dùng đủ 1 lọ (2-3 tháng) mới thấy kết quả. Da cần thời gian thích ứng.

#skincare #dânvănphòng #tiếtkiệm #vitaminC #niacinamide #dưỡngda`,
  },
  {
    title: "Quản trị tài chính cá nhân: Quy tắc 50/30/20 thực tế",
    niche: "finance/productivity",
    platform: "instagram",
    rawContent: `Lương về tay chưa kịp mừng đã hết? 😅

Thử áp dụng quy tắc 50/30/20 ngay hôm nay:

📊 50% - CẦN (Needs): Ăn ở, đi lại, bảo hiểm, điện nước, nợ
📊 30% - MUỐN (Wants): Ăn uống ngoài, giải trí, mua sắm, du lịch
📊 20% - TƯƠNG LAI (Savings): Tiết kiệm, đầu tư, quỹ khẩn cấp

🎯 Ví dụ thu nhập 15tr:
- 7.5tr: Chi phí bắt buộc
- 4.5tr: Giải trí, hưởng thụ
- 3tr: Tiết kiệm/đầu tư

💡 Mẹo thực hành:
• Tự động chuyển 20% vào tài khoản riêng ngay khi lương về
• Dùng app ghi chi tiêu (Money Lover, Spendee, Excel)
• Review hàng tháng: đâu thừa, đâu thiếu?

Đừng đợi "dư tiền mới tiết kiệm". Hãy "tiết kiệm trước, dùng sau".

#tài_chính_cá_nhân #quản_trị_tiền #503020 #tiết_kiệm #đầu_tư #thoát_nợ #financial_freedom`,
  },
  {
    title: "3 thói quen sáng tạo năng lượng cho creator",
    niche: "lifestyle/creator",
    platform: "youtube",
    rawContent: `Tại sao một số creator luôn tràn năng mà bạn thì kiệt sức? ⚡

Không phải thiên phú - là THÓI QUEN:

🌅 1. Sáng sớm KHÔNG chạm điện thoại (30 phút đầu tiên)
- Uống nước lọc ấm
- Viết 3 việc quan trọng nhất hôm nay
- Stretch nhẹ nhàng 5 phút

🎯 2. "Deep work" block 2 tiếng không gián đoạn
- Tắt thông báo, để máy bay
- Chỉ làm 1 việc: viết kịch bản / quay / dựng
- Pomodoro 50/10 nếu cần

🌙 3. Tối trước 22h: Review + Prep
- 5 phút: Đã xong gì? Chưa xong gì?
- 5 phút: Chuẩn bị ngày mai (outfit, props, outline)
- Ngủ trước 23h để non-REM sleep tối đa

🔑 Bí mật: Nhất quán > Cường độ. Làm mỗi ngày một chút tốt hơn một lần cầu toàn.

Bạn đang bỏ lỡ thói quen nào? Comment cho mình biết 👇

#creatorlife #thóiquen #năng_lượng #deepwork #sáng_tạo #productivity #youtuber #tiktoker`,
  },
];

// Helper to get a random sample (for variety in testing)
export function getRandomSampleContent(): SampleContent {
  const index = Math.floor(Math.random() * SAMPLE_CONTENTS.length);
  return SAMPLE_CONTENTS[index]!;
}

// Helper to get sample by niche
export function getSampleContentByNiche(niche: string): SampleContent | undefined {
  return SAMPLE_CONTENTS.find((sample) => sample.niche === niche);
}