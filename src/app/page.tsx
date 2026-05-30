import { Bookmark, BrainCircuit, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Bookmark,
    title: "Swipe Board",
    description: "Lưu và tổ chức bài viral tiếng Việt từ mọi nền tảng.",
  },
  {
    icon: BrainCircuit,
    title: "AI Breakdown",
    description: "Phân tích Hook, Angle, Structure và CTA tự động.",
  },
  {
    icon: Sparkles,
    title: "Remix Generator",
    description: "Biến content thành nội dung mới theo giọng viết của bạn.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <section className="space-y-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Vietnamese Eden MVP
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Chào mừng đến Vietnamese Eden
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            AI Content Workspace cho creator tiếng Việt
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="lg">Bắt đầu ngay</Button>
            <Button variant="outline" size="lg">
              Xem demo
            </Button>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tính năng đang được phát triển — sẵn sàng cho sprint tiếp
                  theo.
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
