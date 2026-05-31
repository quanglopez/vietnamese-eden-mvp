import { FolderX, Shuffle, Timer } from "lucide-react";

const PAINS = [
  {
    icon: FolderX,
    title: "Inspiration rải rác",
    body: "Link TikTok, screenshot, note — khó tìm lại khi cần remix.",
  },
  {
    icon: Shuffle,
    title: "Remix mất giọng",
    body: "Chat AI chung chung, không giữ được tone thương hiệu cá nhân.",
  },
  {
    icon: Timer,
    title: "Từ ý tưởng đến lịch đăng quá lâu",
    body: "Phân tích, viết lại, copy sang sheet — nhiều bước thủ công.",
  },
] as const;

export function LandingProblem() {
  return (
    <section className="border-y border-border/60 bg-surface px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Creator Việt đang mất thời gian ở đâu?
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Bạn không thiếu ý tưởng — bạn thiếu hệ thống biến bài viral thành nội dung có giọng
            riêng và lịch đăng rõ ràng.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {PAINS.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-border/60 bg-surface-elev p-6 shadow-card"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand-soft text-brand">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
