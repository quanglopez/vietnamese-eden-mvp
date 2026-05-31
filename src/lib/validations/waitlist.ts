import { z } from "zod/v4";

export const waitlistSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên cần ít nhất 2 ký tự.")
    .max(120, "Họ tên quá dài."),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ.")
    .max(254, "Email quá dài."),
  useCase: z
    .string()
    .trim()
    .min(10, "Mô tả use case cần ít nhất 10 ký tự.")
    .max(500, "Mô tả use case tối đa 500 ký tự."),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
