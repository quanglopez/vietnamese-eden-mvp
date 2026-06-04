import type { FeedbackCategory, FeedbackPriority } from "@/types/feedback";
import { isFeedbackCategory, isFeedbackPriority } from "@/types/feedback";

const CATEGORY_KEYWORDS: Record<FeedbackCategory, string[]> = {
  bug: [
    "lỗi",
    "error",
    "crash",
    "fail",
    "không được",
    "500",
    "broken",
    "mất data",
    "không lưu",
  ],
  ux: [
    "khó hiểu",
    "không thấy",
    "không biết",
    "confusing",
    "ở đâu",
    "bấm nào",
    "không tìm",
  ],
  fr: ["muốn", "ước", "thêm", "có thể", "auto", "tự động", "feature", "tính năng"],
  ai: [
    "ai",
    "hook",
    "remix",
    "giọng",
    "tiếng việt",
    "máy",
    "không tự nhiên",
    "chất lượng",
  ],
  price: ["giá", "đắt", "rẻ", "trả phí", "200k", "pricing", "cost", "worth"],
  positive: ["hay", "tuyệt", "thích", "good", "great", "tốt", "ưng", "đỉnh", "amazing"],
};

export function suggestCategory(text: string): FeedbackCategory | null {
  const lower = text.toLowerCase();
  const scores: Record<FeedbackCategory, number> = {
    bug: 0,
    ux: 0,
    fr: 0,
    ai: 0,
    price: 0,
    positive: 0,
  };

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    FeedbackCategory,
    string[],
  ][]) {
    scores[cat] = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] as
    | [FeedbackCategory, number]
    | undefined;
  return best && best[1] > 0 ? best[0] : null;
}

export type ParsedImportRow = {
  rawSummary: string;
  category: FeedbackCategory | null;
  priority: FeedbackPriority | null;
};

export function parseImportText(text: string): ParsedImportRow[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const blocks = trimmed.includes("\n\n")
    ? trimmed.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
    : trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean);

  return blocks.map((block) => {
    const delimiter = block.includes("|") ? "|" : block.includes("\t") ? "\t" : null;
    const parts = delimiter ? block.split(delimiter).map((p) => p.trim()) : [block];
    const rawSummary = parts[0] ?? block;
    if (rawSummary.length < 3) {
      return null;
    }

    let category: FeedbackCategory | null = null;
    let priority: ParsedImportRow["priority"] = null;

    if (parts[1] && isFeedbackCategory(parts[1])) {
      category = parts[1];
    }
    if (parts[2] && isFeedbackPriority(parts[2].toLowerCase())) {
      priority = parts[2].toLowerCase() as FeedbackPriority;
    }

    if (!category) {
      category = suggestCategory(rawSummary);
    }

    return { rawSummary, category, priority };
  }).filter((row): row is ParsedImportRow => row !== null);
}

export type WeeklySummaryCounts = {
  periodLabel: string;
  total: number;
  untriaged: number;
  triaged: number;
  actioned: number;
  closed: number;
  byCategory: Record<FeedbackCategory, number>;
  byPriority: { p0: number; p1: number; p2: number; p3: number; unset: number };
};

export function formatWeeklySummaryMarkdown(stats: WeeklySummaryCounts): string {
  const lines = [
    `## Tóm tắt phản hồi — ${stats.periodLabel}`,
    "",
    "| Chỉ số | Số lượng |",
    "|--------|----------|",
    `| Tổng mục (7 ngày) | ${stats.total} |`,
    `| Chưa phân loại | ${stats.untriaged} |`,
    `| Đã phân loại | ${stats.triaged} |`,
    `| Đã xử lý | ${stats.actioned} |`,
    `| Đã đóng | ${stats.closed} |`,
    "",
    "### Theo danh mục",
    "",
    "| Danh mục | Số |",
    "|----------|-----|",
    ...Object.entries(stats.byCategory).map(
      ([cat, count]) => `| ${cat} | ${count} |`,
    ),
    "",
    "### Theo ưu tiên",
    "",
    `| P0 | ${stats.byPriority.p0} |`,
    `| P1 | ${stats.byPriority.p1} |`,
    `| P2 | ${stats.byPriority.p2} |`,
    `| P3 | ${stats.byPriority.p3} |`,
    `| Chưa gán | ${stats.byPriority.unset} |`,
  ];
  return lines.join("\n");
}
