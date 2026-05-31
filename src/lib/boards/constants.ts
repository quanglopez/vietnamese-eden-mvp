export const BOARD_GRADIENTS = [
  "from-brand to-brand-2",
  "from-brand-2 to-brand-3",
  "from-brand-3 to-brand-4",
  "from-brand-4 to-brand",
  "from-brand to-brand-3",
  "from-brand-2 to-brand-4",
] as const;

export const BOARD_EMOJIS = ["🪝", "✨", "🍜", "📦", "🎙️", "💸", "🔥", "📌"] as const;

export function getBoardGradient(index: number, color: string | null): string {
  if (color?.startsWith("from-")) {
    return color;
  }
  return BOARD_GRADIENTS[index % BOARD_GRADIENTS.length] ?? BOARD_GRADIENTS[0];
}

export function getBoardEmoji(index: number): string {
  return BOARD_EMOJIS[index % BOARD_EMOJIS.length] ?? "📌";
}

export function formatBoardUpdatedAt(iso: string): string {
  const updated = new Date(iso).getTime();
  const diffMs = Date.now() - updated;

  if (Number.isNaN(updated)) {
    return "Chưa cập nhật";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return "Vừa cập nhật";
  }
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ngày trước`;
  }

  return new Date(iso).toLocaleDateString("vi-VN");
}

export function slugifyWorkspaceName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return base.length > 0 ? base : "workspace";
}
