import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-brand-soft" aria-hidden />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="inline-flex rounded-full border border-border/80 bg-surface-elev px-3 py-1 text-xs font-medium text-muted-foreground">
          AI content workspace · Creator & agency Việt Nam
        </p>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Từ bài viral đến{" "}
          <span className="text-gradient-brand">nội dung của bạn</span>
          <br />
          — trong một workspace
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Lưu swipe file, phân tích hook &amp; CTA bằng AI, remix tiếng Việt theo giọng viết cá
          nhân, rồi đưa thẳng vào lịch đăng — dành cho creator và agency làm content hàng ngày.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="gap-2 bg-foreground text-background shadow-glow hover:bg-foreground/90"
          >
            <a href="#waitlist">
              Dùng thử bản beta
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <a href="#how-it-works">
              <Play className="h-4 w-4" />
              Xem demo
            </a>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Đăng nhập
          </Link>
          {" · "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </section>
  );
}
