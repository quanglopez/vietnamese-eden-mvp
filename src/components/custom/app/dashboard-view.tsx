"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Eye,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { dashboardBoards, dashboardPosts } from "@/lib/ui/mock-dashboard-data";

import { AppShell } from "./app-shell";

type DashboardViewProps = {
  title: string;
  subtitle: string;
};

export function DashboardView({ title, subtitle }: DashboardViewProps) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Post đã lưu",
            value: "164",
            trend: "+18 tuần này",
            icon: Bookmark,
            c: "from-brand to-brand-2",
          },
          {
            label: "AI breakdown",
            value: "92",
            trend: "+24 tuần này",
            icon: Sparkles,
            c: "from-brand-2 to-brand-3",
          },
          {
            label: "Remix đã tạo",
            value: "47",
            trend: "+11 tuần này",
            icon: Flame,
            c: "from-brand-3 to-brand-4",
          },
          {
            label: "Tổng view trend",
            value: "8.4M",
            trend: "+34% tháng",
            icon: Eye,
            c: "from-brand-4 to-brand",
          },
        ].map(({ label, value, trend, icon: Icon, c }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-surface-elev p-5">
            <div className="flex items-center justify-between">
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c} grid place-items-center shadow-glow`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-brand font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> {trend}
              </span>
            </div>
            <div className="mt-4 font-display text-3xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand" /> Trending tuần này
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/boards">Xem tất cả</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {dashboardPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/breakdown/${post.id}`}
                  className="group rounded-2xl border border-border/60 bg-surface-elev overflow-hidden hover:shadow-card transition"
                >
                  <div
                    className={`aspect-[16/10] bg-gradient-to-br ${post.thumb} p-4 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">
                        {post.platform}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">
                        {post.views} views
                      </span>
                    </div>
                    <div className="text-white font-display font-semibold text-sm line-clamp-3">
                      {post.hook}
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold">{post.author}</div>
                      <div className="text-muted-foreground">{post.handle}</div>
                    </div>
                    <Sparkles className="h-4 w-4 text-brand opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-gradient-brand-soft p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand grid place-items-center shadow-glow shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">Gợi ý của AI hôm nay</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Niche Beauty đang nổi hook dạng &quot;Tôi đã bỏ X triệu để…&quot;. Bạn có 3 video
                  lưu dùng được công thức này.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="bg-foreground text-background" asChild>
                    <Link href="/remix">Remix ngay</Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    Để sau
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border/60 bg-surface-elev p-5">
            <h3 className="font-display font-bold mb-4">Bảng gần đây</h3>
            <div className="space-y-3">
              {dashboardBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="flex items-center gap-3 hover:bg-accent/40 -mx-2 px-2 py-1.5 rounded-lg"
                >
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${board.color} grid place-items-center text-lg`}
                  >
                    {board.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{board.name}</div>
                    <div className="text-xs text-muted-foreground">{board.count} post</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-surface-elev p-5">
            <h3 className="font-display font-bold mb-3">Streak của bạn 🔥</h3>
            <div className="font-display text-4xl font-extrabold text-gradient-brand">
              12 ngày
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bạn đã phân tích ít nhất 1 video mỗi ngày trong 12 ngày liền.
            </p>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-7 flex-1 rounded ${index < 12 ? "bg-gradient-brand" : "bg-muted"}`}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
