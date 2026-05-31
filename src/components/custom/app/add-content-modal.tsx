"use client";

import Link from "next/link";
import { FolderHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AddContentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Thêm nội dung</DialogTitle>
          <DialogDescription>
            Trong MVP beta, thêm content trực tiếp trong từng bảng cảm hứng (paste text hoặc dán
            link).
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Mở một board → bấm <strong>Thêm nội dung</strong> trên trang chi tiết board để lưu và
          phân tích.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button asChild className="gap-2 bg-foreground text-background">
            <Link href="/boards" onClick={() => onOpenChange(false)}>
              <FolderHeart className="h-4 w-4" />
              Đi tới Boards
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
