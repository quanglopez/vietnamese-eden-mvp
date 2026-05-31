"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export const VOICE_SAMPLE_BEAUTY = `Hôm nay mình thử serum mới, kết quả sau 7 ngày mà thấy da sáng hẳn. Mình không thích review kiểu chém gió, chỉ chia sẻ thật lòng. Nếu bạn cũng đang tìm sản phẩm phù hợp da dầu, comment bên dưới nhé — mình gửi review chi tiết hơn.


Mấy bạn hỏi mình dùng gì để da đẹp, hôm nay mình quay cả buổi skincare từ A-Z. Không quảng cáo, không PR, chỉ là routine mình làm mỗi tối. Đừng skip phần này vì đây là bí kíp mình đã test 6 tháng.`;

export const VOICE_SAMPLE_COACH = `Nhiều người nghĩ xây thương hiệu cá nhân là đăng thật nhiều. Nhưng vấn đề không nằm ở tần suất, mà nằm ở việc bạn có một góc nhìn rõ ràng, lặp lại đủ lâu, và biến trải nghiệm cá nhân thành bài học có ích cho người đọc.


Trong 3 năm đồng hành với hơn 200 founder, mình nhận ra điểm chung của người tạo nội dung hiệu quả: họ không viết về cái họ biết — họ viết về cái họ đã TRẢI QUA.`;

const EXAMPLES = [
  {
    id: "beauty",
    label: "Ví dụ 1 — Beauty/TikTok creator",
    text: VOICE_SAMPLE_BEAUTY,
  },
  {
    id: "coach",
    label: "Ví dụ 2 — Coach/Expert LinkedIn",
    text: VOICE_SAMPLE_COACH,
  },
] as const;

type VoiceSampleExamplesProps = {
  onUseSample: (text: string) => void;
  disabled?: boolean;
};

export function VoiceSampleExamples({ onUseSample, disabled }: VoiceSampleExamplesProps) {
  return (
    <details className="group rounded-xl border border-border/60 bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span>📝 Xem ví dụ mẫu</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3">
        {EXAMPLES.map((example) => (
          <div key={example.id} className="space-y-2">
            <p className="text-xs font-semibold text-brand">{example.label}</p>
            <pre className="max-h-40 overflow-y-auto rounded-lg bg-background/80 p-3 text-xs leading-relaxed whitespace-pre-wrap font-sans text-muted-foreground border border-border/40">
              {example.text}
            </pre>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onUseSample(example.text)}
            >
              Dùng mẫu này
            </Button>
          </div>
        ))}
      </div>
    </details>
  );
}
