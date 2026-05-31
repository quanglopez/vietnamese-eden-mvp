import type { Metadata } from "next";
import { Figtree, Inter, Outfit } from "next/font/google";

import { QueryProvider } from "@/components/custom/query-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vietnamese Eden - AI Content Workspace",
  description:
    "AI Content Workspace cho creator tiếng Việt — lưu bài viral, phân tích content, học giọng viết và remix nội dung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} ${figtree.variable} min-h-screen font-sans antialiased`}
        style={{ ["--font-display" as string]: "var(--font-outfit)" }}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
