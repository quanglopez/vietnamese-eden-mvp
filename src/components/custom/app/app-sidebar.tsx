"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderHeart,
  LayoutDashboard,
  Mic,
  Plus,
  Sparkles,
  Tag,
  Wand2,
} from "lucide-react";

import { SignOutButton } from "@/components/custom/auth/sign-out-button";
import { Button } from "@/components/ui/button";

import { useAppSession } from "./app-session-provider";

const nav = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, exact: true as const },
  { href: "/boards", label: "Bảng cảm hứng", icon: FolderHeart, exact: false as const },
  { href: "/breakdown", label: "AI Breakdown", icon: Sparkles, exact: false as const },
  { href: "/voice", label: "Giọng văn", icon: Mic, exact: false as const },
  { href: "/remix", label: "Remix AI", icon: Wand2, exact: false as const },
  { href: "/calendar", label: "Lịch 30 ngày", icon: CalendarDays, exact: false as const },
  { href: "/pricing", label: "Gói cước", icon: Tag, exact: false as const },
] as const;

function getInitials(fullName: string | null, email: string | undefined) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase() || "U";
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function AppSidebar({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const { email, fullName } = useAppSession();
  const initials = getInitials(fullName, email);
  const displayName = fullName ?? email?.split("@")[0] ?? "Creator";

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-64 flex-col border-r border-border/60 bg-sidebar">
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base">Vietnamese Eden</div>
            <div className="text-[11px] text-muted-foreground">AI content workspace</div>
          </div>
        </Link>
      </div>

      <div className="px-3">
        <Button
          onClick={onAdd}
          className="w-full justify-start gap-2 bg-gradient-brand text-white hover:opacity-95 shadow-glow"
        >
          <Plus className="h-4 w-4" /> Thêm nội dung
        </Button>
      </div>

      <nav className="mt-6 px-3 space-y-0.5 flex-1">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl p-4 bg-gradient-brand-soft border border-border/60">
        <div className="text-xs font-semibold text-foreground">Beta MVP</div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Gói cước và billing sẽ có ở phiên bản sau.
        </div>
        <Link href="/pricing">
          <Button
            size="sm"
            className="mt-3 w-full bg-foreground text-background hover:bg-foreground/90"
          >
            Xem gói
          </Button>
        </Link>
      </div>

      <div className="px-5 py-4 border-t border-border/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-brand grid place-items-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="text-xs leading-tight min-w-0 flex-1">
            <div className="font-semibold truncate">{displayName}</div>
            <div className="text-muted-foreground truncate">{email ?? "Creator"}</div>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
