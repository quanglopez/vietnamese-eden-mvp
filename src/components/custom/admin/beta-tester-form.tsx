"use client";

import { useEffect, useState, useTransition } from "react";

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
import {
  createBetaTesterAction,
  updateBetaTesterAction,
  type CreateBetaTesterInput,
  type UpdateBetaTesterInput,
} from "@/lib/beta-testers/actions";
import {
  BETA_CORE_FLOW_STATUS_OPTIONS,
  BETA_FEEDBACK_STATUS_OPTIONS,
  BETA_INVITE_STATUS_OPTIONS,
  BETA_PERSONA_OPTIONS,
  BETA_SIGNUP_STATUS_OPTIONS,
  type BetaTesterWithHint,
} from "@/types/beta-testers";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type BetaTesterFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  mode: "create" | "edit";
  tester?: BetaTesterWithHint;
};

export function BetaTesterForm({
  open,
  onOpenChange,
  workspaceId,
  mode,
  tester,
}: BetaTesterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [persona, setPersona] = useState<CreateBetaTesterInput["persona"]>("other");
  const [inviteStatus, setInviteStatus] =
    useState<CreateBetaTesterInput["inviteStatus"]>("pending");
  const [signupStatus, setSignupStatus] =
    useState<CreateBetaTesterInput["signupStatus"]>("not_signed_up");
  const [coreFlowStatus, setCoreFlowStatus] =
    useState<CreateBetaTesterInput["coreFlowStatus"]>("not_started");
  const [feedbackStatus, setFeedbackStatus] =
    useState<CreateBetaTesterInput["feedbackStatus"]>("not_requested");
  const [userId, setUserId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && tester) {
      setEmail(tester.email);
      setFullName(tester.full_name ?? "");
      setPersona(tester.persona);
      setInviteStatus(tester.invite_status);
      setSignupStatus(tester.signup_status);
      setCoreFlowStatus(tester.core_flow_status);
      setFeedbackStatus(tester.feedback_status);
      setUserId(tester.user_id ?? "");
      setNotes(tester.notes ?? "");
    } else {
      setEmail("");
      setFullName("");
      setPersona("other");
      setInviteStatus("pending");
      setSignupStatus("not_signed_up");
      setCoreFlowStatus("not_started");
      setFeedbackStatus("not_requested");
      setUserId("");
      setNotes("");
    }
  }, [open, mode, tester]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "create") {
        const result = await createBetaTesterAction({
          workspaceId,
          email,
          fullName,
          persona,
          inviteStatus,
          signupStatus,
          coreFlowStatus,
          feedbackStatus,
          userId: userId.trim() || null,
          notes,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        return;
      }

      if (!tester) return;

      const patch: UpdateBetaTesterInput = {
        testerId: tester.id,
        workspaceId,
        fullName,
        persona,
        inviteStatus,
        signupStatus,
        coreFlowStatus,
        feedbackStatus,
        userId: userId.trim() || null,
        notes,
      };

      const result = await updateBetaTesterAction(patch);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm beta tester" : "Sửa beta tester"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm người vào cohort beta của workspace. Không gửi email tự động."
              : "Cập nhật trạng thái và ghi chú nội bộ."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="beta-email">Email</Label>
              <Input
                id="beta-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                placeholder="creator@example.com"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="beta-full-name">Họ tên</Label>
            <Input
              id="beta-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isPending}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beta-persona">Persona</Label>
            <select
              id="beta-persona"
              value={persona}
              onChange={(e) =>
                setPersona(e.target.value as CreateBetaTesterInput["persona"])
              }
              disabled={isPending}
              className={selectClassName}
            >
              {BETA_PERSONA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beta-invite">Mời</Label>
              <select
                id="beta-invite"
                value={inviteStatus}
                onChange={(e) =>
                  setInviteStatus(e.target.value as NonNullable<typeof inviteStatus>)
                }
                disabled={isPending}
                className={selectClassName}
              >
                {BETA_INVITE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-signup">Đăng ký</Label>
              <select
                id="beta-signup"
                value={signupStatus}
                onChange={(e) =>
                  setSignupStatus(e.target.value as NonNullable<typeof signupStatus>)
                }
                disabled={isPending}
                className={selectClassName}
              >
                {BETA_SIGNUP_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beta-core-flow">Core flow</Label>
              <select
                id="beta-core-flow"
                value={coreFlowStatus}
                onChange={(e) =>
                  setCoreFlowStatus(e.target.value as NonNullable<typeof coreFlowStatus>)
                }
                disabled={isPending}
                className={selectClassName}
              >
                {BETA_CORE_FLOW_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-feedback">Feedback</Label>
              <select
                id="beta-feedback"
                value={feedbackStatus}
                onChange={(e) =>
                  setFeedbackStatus(e.target.value as NonNullable<typeof feedbackStatus>)
                }
                disabled={isPending}
                className={selectClassName}
              >
                {BETA_FEEDBACK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beta-user-id">User ID (tuỳ chọn)</Label>
            <Input
              id="beta-user-id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isPending}
              placeholder="UUID sau khi đăng ký"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Liên kết tài khoản để gợi ý core flow từ analytics.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beta-notes">Ghi chú</Label>
            <Textarea
              id="beta-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              rows={3}
              placeholder="Ghi chú nội bộ (chỉ admin)"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu…" : mode === "create" ? "Thêm tester" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
