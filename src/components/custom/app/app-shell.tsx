"use client";

import { useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AddContentModal } from "./add-content-modal";
import { AppSidebar } from "./app-sidebar";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onAdd={() => setOpen(true)} />
      <main className="md:ml-64">
        <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-border/60">
          <div className="flex items-center gap-4 px-6 lg:px-10 h-16">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold truncate">{title}</h1>
              {subtitle ? (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              ) : null}
            </div>
            <div className="hidden lg:flex items-center gap-2 w-80">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm post, hook, creator…"
                  className="pl-9 h-10 bg-surface"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Thông báo">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-brand text-white gap-2 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Thêm
            </Button>
          </div>
        </header>
        <div className="px-6 lg:px-10 py-8 max-w-[1400px]">{children}</div>
      </main>
      <AddContentModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
