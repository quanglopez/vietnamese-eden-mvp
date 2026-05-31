"use client";

import { useState } from "react";
import { ClipboardPaste, Link2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function AddContentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  const handleAnalyze = () => {
    setNotice("Tính năng phân tích AI sẽ có ở sprint tiếp theo.");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setNotice(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Thêm nội dung để phân tích
          </DialogTitle>
          <DialogDescription>
            Dán link TikTok, Instagram, YouTube hoặc paste nguyên caption. AI sẽ bóc tách hook,
            cấu trúc và lý do viral.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" /> Dán link
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <ClipboardPaste className="h-4 w-4" /> Paste text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-3 pt-4">
            <Input
              placeholder="https://www.tiktok.com/@trangbeauty/video/..."
              className="h-12"
            />
            <div className="text-xs text-muted-foreground">
              Hỗ trợ TikTok, Instagram Reels, YouTube Shorts, Threads, Facebook Reels.
            </div>
          </TabsContent>

          <TabsContent value="text" className="pt-4">
            <Textarea
              placeholder="Dán caption hoặc script bạn muốn AI phân tích…"
              className="min-h-[160px] resize-none"
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground">
            {notice ? (
              <span className="text-brand font-medium">{notice}</span>
            ) : (
              <>
                Sẽ lưu vào{" "}
                <span className="font-semibold text-foreground">Hook viral 2026</span>
              </>
            )}
          </div>
          <Button
            onClick={handleAnalyze}
            className="bg-gradient-brand text-white shadow-glow"
          >
            <Sparkles className="h-4 w-4" />
            Phân tích bằng AI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
