import type { GeneratedOutputView } from "@/types/remix";

const STATUS_LABELS: Record<GeneratedOutputView["status"], string> = {
  draft: "Bản nháp",
  ready: "Sẵn sàng",
  published: "Đã đăng",
  archived: "Lưu trữ",
};

export function getOutputStatusLabel(status: GeneratedOutputView["status"]): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatOutputCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function getOutputDisplayTitle(output: GeneratedOutputView): string {
  if (output.title.trim()) {
    return output.title;
  }
  return `${output.formatLabel} · ${output.toneLabel} · ${formatOutputCreatedAt(output.createdAt)}`;
}

export function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "remix";
}
