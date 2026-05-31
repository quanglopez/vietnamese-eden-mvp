"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBoardAction } from "@/lib/boards/actions";

type CreateBoardDialogProps = {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function CreateBoardDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: CreateBoardDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createBoardAction({
        workspaceId,
        name,
        description,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onCreated?.();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetForm();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Tạo bảng mới</DialogTitle>
            <DialogDescription>
              Gom bài viral theo niche, client hoặc campaign trong workspace của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Tên bảng</Label>
              <Input
                id="board-name"
                placeholder="Ví dụ: Hook viral 2026"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isPending}
                required
                minLength={2}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">Mô tả (tuỳ chọn)</Label>
              <Textarea
                id="board-description"
                placeholder="Bảng này dùng để…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isPending}
                className="min-h-[88px] resize-none"
                maxLength={280}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isPending || name.trim().length < 2}
              className="bg-gradient-brand text-white shadow-glow gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Tạo bảng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
