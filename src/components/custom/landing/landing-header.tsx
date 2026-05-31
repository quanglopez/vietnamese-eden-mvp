import Link from "next/link";

import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#features", label: "Tính năng" },
  { href: "#pricing", label: "Gói cước" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Vietnamese <span className="text-gradient-brand">Eden</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild className="bg-foreground text-background hover:bg-foreground/90">
            <a href="#waitlist">Tham gia beta</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
