import { z } from "zod";

const platformValues = ["tiktok", "facebook", "instagram", "youtube", "other"] as const;

export const addContentTextSchema = z.object({
  boardId: z.string().uuid("Board không hợp lệ"),
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề quá dài"),
  rawContent: z
    .string()
    .trim()
    .min(1, "Nội dung không được để trống")
    .max(20_000, "Nội dung quá dài"),
  platform: z.enum(platformValues).optional(),
  sourceUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) {
          return true;
        }
        return z.string().url().safeParse(value).success;
      },
      { message: "URL không hợp lệ" },
    ),
});

export type AddContentTextInput = z.infer<typeof addContentTextSchema>;

export const addContentUrlSchema = z.object({
  boardId: z.string().uuid("Board không hợp lệ"),
  sourceUrl: z
    .string()
    .trim()
    .min(1, "URL không được để trống")
    .refine((value) => {
      try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const parsed = new URL(normalized);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, { message: "URL không hợp lệ" }),
  title: z
    .string()
    .trim()
    .max(200, "Tiêu đề quá dài")
    .optional(),
});

export type AddContentUrlInput = z.infer<typeof addContentUrlSchema>;

export const PLATFORM_OPTIONS = [
  { value: "other", label: "Khác / chưa xác định" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
] as const;
