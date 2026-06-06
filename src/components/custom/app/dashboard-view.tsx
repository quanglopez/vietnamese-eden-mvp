"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  FolderHeart,
  Mic,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OnboardingChecklistProgress } from "@/components/custom/dashboard/onboarding-checklist";
import { OnboardingChecklist } from "@/components/custom/dashboard/onboarding-checklist";
import { ContinueWhereYouLeftOff } from "@/components/custom/dashboard/continue-where-you-left-off";
import type { ContinueWhereYouLeftOffData } from "@/lib/boards/continue-queries";
import type { BoardListItem } from "@/types/boards";

import { FetchErrorBanner } from "./fetch-error-banner";
import { AppShell } from "./app-shell";

type DashboardViewProps = {
  title: string;
  subtitle: string;
  boards: BoardListItem[];
  checklistProgress: OnboardingChecklistProgress | null;
  continueData?: ContinueWhereYouLeftOffData;
  fetchError?: string | null;
};

const quickLinks = [
  {
    href: "/boards",
    label: "Bảng cảm hứng",
    desc: "Tạo board và thêm content",
    icon: FolderHeart,
  },
  {
    href: "/voice",
    label: "Giọng văn",
    desc: "Huấn luyện voice profile",
    icon: Mic,
  },
  {
    href: "/calendar",
    label: "Lịch nội dung",
    desc: "Lên lịch đăng remix",
    footnote: "Chỉ nhắc lịch — không auto-post",
    icon: CalendarDays,
  },
] as const;

function DashboardHeroCard() {
  return (
    <div className="rounded-2xl border border-brand/30 bg-gradient-brand-soft p-6 mb-8">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand" />
        Bắt đầu demo MVP
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        Luồng chính: Board → thêm content → AI Breakdown → Remix → Calendar. Số liệu dưới đây là
        minh hoạ UI; dữ liệu thật nằm trong từng board.
      </p>
      <Button asChild size="sm" className="mt-4 gap-2 bg-foreground text-background">
        <Link href="/boards">
          <FolderHeart className="h-4 w-4" />
          Mở bảng cảm hứng
        </Link>
      </Button>
    </div>
  );
}

export function DashboardView({
  title,
  subtitle,
  boards,
  checklistProgress,
  continueData,
  fetchError,
}: DashboardViewProps) {
  const hasContinueNudge = continueData && continueData.boards.length > 0;

  return (
    <AppShell title={title} subtitle={subtitle}>
      {fetchError ? (
        <FetchErrorBanner message={`Không tải được dữ liệu tổng quan: ${fetchError}`} />
      ) : null}
      {checklistProgress ? (
        <OnboardingChecklist progress={checklistProgress} fallback={<DashboardHeroCard />} />
      ) : (
        <DashboardHeroCard />
      )}

      {/* Continue where you left off — shown for returning users with boards */}
      {hasContinueNudge ? (
        <ContinueWhereYouLeftOff boards={continueData.boards} />
      ) : null}

      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Bước 1", value: "Board", hint: "Tạo & quản lý content", icon: FolderHeart },
          { label: "Bước 2", value: "Breakdown", hint: "Phân tích AI", icon: Sparkles },
          { label: "Bước 3", value: "Remix", hint: "Biến thể nội dung", icon: Wand2 },
          { label: "Bước 4", value: "Calendar", hint: "Lên lịch (không auto-post)", icon: CalendarDays },
        ].map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-surface-elev p-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">{label}</div>
            <div className="font-display text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{hint}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-bold">Truy cập nhanh</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickLinks.map(({ href, label, desc, icon: Icon, ...rest }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-border/60 bg-surface-elev p-5 hover:shadow-card transition group"
              >
                <Icon className="h-6 w-6 text-brand mb-3" />
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                {"footnote" in rest && rest.footnote ? (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    ({rest.footnote})
                  </span>
                ) : null}
                <span className="text-xs text-brand mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Mở <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside>
          <section className="rounded-2xl border border-border/60 bg-surface-elev p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Bảng của bạn</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/boards">Tất cả</Link>
              </Button>
            </div>
            {boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có board.{" "}
                <Link href="/boards" className="text-brand hover:underline">
                  Tạo board đầu tiên
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {boards.slice(0, 5).map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex items-center gap-3 hover:bg-accent/40 -mx-2 px-2 py-1.5 rounded-lg"
                  >
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${board.gradientClass} grid place-items-center text-lg`}
                    >
                      {board.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{board.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {board.contentCount} nội dung
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-muted/30 p-5 mt-4 text-xs text-muted-foreground">
            <Bookmark className="h-4 w-4 text-brand mb-2" />
            Mẹo demo: dùng <code className="text-foreground">AI_USE_MOCK=true</code> trong{" "}
            <code className="text-foreground">.env.local</code> để chạy AI không cần API key.
          </section>
        </aside>
      </div>
    </AppShell>
  );
}