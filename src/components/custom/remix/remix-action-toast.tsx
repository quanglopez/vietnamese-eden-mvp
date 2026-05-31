"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";

export type RemixToast = {
  type: "success" | "error";
  message: string;
};

type RemixActionToastProps = {
  toast: RemixToast | null;
  onDismiss: () => void;
};

export function RemixActionToast({ toast, onDismiss }: RemixActionToastProps) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg flex items-start gap-3 ${
        isSuccess
          ? "border-brand/40 bg-surface-elev text-foreground"
          : "border-destructive/40 bg-destructive/5 text-destructive"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
      )}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
