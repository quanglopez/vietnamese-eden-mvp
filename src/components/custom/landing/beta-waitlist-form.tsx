"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { joinBetaWaitlistAction } from "@/lib/waitlist/actions";
import {
  waitlistSchema,
  type WaitlistFormValues,
} from "@/lib/validations/waitlist";

export function BetaWaitlistForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      fullName: "",
      email: "",
      useCase: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const result = await joinBetaWaitlistAction(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (field === "fullName" || field === "email" || field === "useCase") {
            setError(field, { message });
          }
        }
      }
      setSubmitError(result.error);
      return;
    }

    setSubmitted(true);
    reset();
  });

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center"
        role="status"
      >
        <p className="font-display text-lg font-semibold text-emerald-900">
          Đã ghi nhận — cảm ơn bạn!
        </p>
        <p className="mt-2 text-sm text-emerald-800/90">
          Chúng tôi sẽ liên hệ khi mở slot beta tiếp theo. Bạn có thể{" "}
          <a href="/signup" className="font-medium underline">
            đăng ký tài khoản
          </a>{" "}
          để dùng thử ngay nếu đã có mời.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Gửi đăng ký khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ tên</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          {...register("fullName")}
          aria-invalid={Boolean(errors.fullName)}
        />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">Bạn làm content thế nào?</Label>
        <Textarea
          id="useCase"
          rows={3}
          placeholder="VD: Creator beauty TikTok, 3 video/tuần, cần remix caption tiếng Việt..."
          {...register("useCase")}
          aria-invalid={Boolean(errors.useCase)}
        />
        {errors.useCase ? (
          <p className="text-sm text-destructive">{errors.useCase.message}</p>
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Gửi đăng ký beta
      </Button>
    </form>
  );
}
