import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vietnamese Eden · AI content workspace
        </p>
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground">
            Tính năng
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground">
            Gói cước
          </a>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Đăng nhập
          </Link>
          <Link href="/signup" className="text-muted-foreground hover:text-foreground">
            Đăng ký
          </Link>
        </nav>
      </div>
    </footer>
  );
}
