"use client";

import type { ReactNode } from "react";

import { AppShell } from "./app-shell";

type ComingSoonPageProps = {
  title: string;
  subtitle: string;
  feature: string;
  children?: ReactNode;
};

export function ComingSoonPage({
  title,
  subtitle,
  feature,
  children,
}: ComingSoonPageProps) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-2xl">
        <h2 className="font-display text-2xl font-bold">{feature}</h2>
        <p className="mt-3 text-muted-foreground">
          Tính năng này sẽ được triển khai ở sprint tiếp theo. Dashboard và navigation đã sẵn
          sàng — dữ liệu thật sẽ được kết nối Supabase sau.
        </p>
        {children}
      </div>
    </AppShell>
  );
}
