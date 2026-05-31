"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VoiceErrorMessageProps = {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function VoiceErrorMessage({ message, onRetry, isRetrying }: VoiceErrorMessageProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="pt-4 space-y-3">
        <div className="flex gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRetrying}
            onClick={onRetry}
          >
            Thử lại
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Nếu lỗi lặp lại, hãy thử tải lại trang hoặc liên hệ owner.
        </p>
      </CardContent>
    </Card>
  );
}
