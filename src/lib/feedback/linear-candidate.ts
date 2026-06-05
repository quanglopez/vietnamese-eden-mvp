import {
  labelForCategory,
  labelForPriority,
  labelForSource,
  truncateSummary,
  type FeedbackCategory,
  type FeedbackEntryRow,
  type FeedbackPriority,
} from "@/types/feedback";

export const RECOMMENDED_LINEAR_PROJECT = "M12 — Beta Launch & Activation";

export type SeverityLabel =
  | "P0 blocker"
  | "P1 major bug"
  | "P2 polish"
  | "UX confusion"
  | "AI quality issue"
  | "Feature request"
  | "Pricing objection"
  | "Positive signal";

export type DuplicateHint = {
  entryId: string;
  summary: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  overlapCount: number;
};

export type LinearCandidateDraft = {
  title: string;
  severityLabel: SeverityLabel;
  categoryLabel: string;
  priorityLabel: string;
  rawSummary: string;
  analystNotes: string;
  evidenceLines: string[];
  acceptanceCriteria: string[];
  duplicateHints: DuplicateHint[];
  recommendedProject: string;
  markdown: string;
};

const DEFAULT_ANALYST_NOTES =
  "Phản hồi từ inbox beta — cần owner xem xét và xác nhận trước khi tạo issue Linear.";

const STOPWORDS = new Set([
  "khi",
  "cho",
  "với",
  "của",
  "và",
  "trên",
  "trong",
  "được",
  "không",
  "này",
  "đó",
  "the",
  "and",
  "for",
  "một",
  "các",
  "có",
  "là",
]);

const CATEGORY_SEVERITY_FALLBACK: Record<FeedbackCategory, SeverityLabel> = {
  bug: "P1 major bug",
  ux: "UX confusion",
  fr: "Feature request",
  ai: "AI quality issue",
  price: "Pricing objection",
  positive: "Positive signal",
};

const PRIORITY_SEVERITY: Record<NonNullable<FeedbackPriority>, SeverityLabel> = {
  p0: "P0 blocker",
  p1: "P1 major bug",
  p2: "P2 polish",
  p3: "P2 polish",
};

export function resolveSeverityLabel(entry: FeedbackEntryRow): SeverityLabel {
  if (entry.priority) {
    return PRIORITY_SEVERITY[entry.priority];
  }
  return CATEGORY_SEVERITY_FALLBACK[entry.category];
}

export function suggestLinearTitle(entry: FeedbackEntryRow): string {
  const tag = entry.priority?.toUpperCase() ?? labelForCategory(entry.category);
  const summary = truncateSummary(entry.raw_summary, 72);
  return `[${tag}] ${summary}`;
}

function extractKeywords(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}'"«»/\\|]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
  return new Set(tokens);
}

function keywordOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const word of a) {
    if (b.has(word)) count += 1;
  }
  return count;
}

export function findDuplicateHints(
  entry: FeedbackEntryRow,
  allEntries: FeedbackEntryRow[],
): DuplicateHint[] {
  const keywords = extractKeywords(entry.raw_summary);
  const hints: DuplicateHint[] = [];

  for (const other of allEntries) {
    if (other.id === entry.id) continue;

    const categoryMatch = other.category === entry.category;
    const priorityMatch =
      entry.priority !== null &&
      other.priority !== null &&
      entry.priority === other.priority;
    const otherKeywords = extractKeywords(other.raw_summary);
    const overlap = keywordOverlap(keywords, otherKeywords);

    if ((categoryMatch || priorityMatch) && overlap >= 2) {
      hints.push({
        entryId: other.id,
        summary: truncateSummary(other.raw_summary, 60),
        category: other.category,
        priority: other.priority,
        overlapCount: overlap,
      });
    }
  }

  return hints.sort((a, b) => b.overlapCount - a.overlapCount);
}

function buildAnalystNotes(entry: FeedbackEntryRow): string {
  const parts: string[] = [];
  if (entry.notes?.trim()) parts.push(entry.notes.trim());
  if (entry.action_notes?.trim()) parts.push(entry.action_notes.trim());
  if (parts.length === 0) return DEFAULT_ANALYST_NOTES;
  return parts.join("\n\n");
}

function buildEvidenceLines(entry: FeedbackEntryRow): string[] {
  const lines = [
    `- Feedback entry ID: \`${entry.id}\``,
    `- Nguồn: ${labelForSource(entry.source)}`,
  ];

  if (entry.source_ref?.trim()) {
    lines.push(`- Tham chiếu nguồn: ${entry.source_ref.trim()}`);
  }
  if (entry.reporter_name?.trim()) {
    lines.push(`- Người báo: ${entry.reporter_name.trim()}`);
  }
  if (entry.reporter_persona) {
    lines.push(`- Persona: ${entry.reporter_persona}`);
  }
  if (entry.cohort) {
    lines.push(`- Cohort: ${entry.cohort}`);
  }
  if (entry.device) {
    lines.push(`- Thiết bị: ${entry.device}`);
  }
  if (entry.reproducible) {
    lines.push(`- Tái hiện được: ${entry.reproducible}`);
  }
  if (entry.verbatim_quotes?.length) {
    lines.push(`- Trích dẫn nguyên văn: ${entry.verbatim_quotes.join(" | ")}`);
  }
  if (entry.linear_issue_id?.trim()) {
    lines.push(`- Linear đã liên kết (thủ công): ${entry.linear_issue_id.trim()}`);
  }

  lines.push(`- Tạo lúc: ${entry.created_at}`);
  lines.push(`- Xem trong app: /admin/feedback`);

  return lines;
}

export function suggestedAcceptanceCriteria(category: FeedbackCategory): string[] {
  switch (category) {
    case "bug":
      return [
        "Xác nhận bước tái hiện và môi trường (device/browser).",
        "Fix được verify trên staging.",
        "Không regress các flow liên quan.",
      ];
    case "ux":
      return [
        "Làm rõ điểm gây nhầm lẫn trong flow hiện tại.",
        "Thiết kế/copy được owner duyệt.",
        "Smoke test desktop + mobile 375px.",
      ];
    case "fr":
      return [
        "Mô tả use case và phạm vi MVP rõ ràng.",
        "Acceptance criteria có thể test được.",
        "Không mở rộng ngoài phạm vi issue.",
      ];
    case "ai":
      return [
        "Ghi nhận prompt/input và output kém chất lượng.",
        "Tiêu chí chất lượng AI được định nghĩa.",
        "Verify cải thiện trên case mẫu.",
      ];
    case "price":
      return [
        "Ghi nhận phản đối giá và ngữ cảnh người dùng.",
        "Đề xuất phản hồi/positioning cho owner.",
        "Không thay đổi billing tự động.",
      ];
    case "positive":
      return [
        "Ghi nhận signal tích cực làm evidence.",
        "Xác định có cần follow-up marketing/product không.",
        "Không tạo issue nếu chỉ là praise không actionable.",
      ];
    default:
      return ["Owner xác nhận phạm vi trước khi tạo issue."];
  }
}

function formatDuplicateSection(hints: DuplicateHint[]): string {
  if (hints.length === 0) {
    return "_Không phát hiện mục tương tự (cảnh báo đơn giản theo danh mục/ưu tiên + từ khóa)._";
  }

  const lines = hints.map(
    (hint) =>
      `- Có thể trùng: \`${hint.entryId.slice(0, 8)}…\` — ${hint.summary} (${labelForCategory(hint.category)}, ${labelForPriority(hint.priority)}, overlap ${hint.overlapCount})`,
  );
  return ["**Cảnh báo:** có thể trùng với mục phản hồi khác.", ...lines].join("\n");
}

export function buildLinearCandidateMarkdown(draft: Omit<LinearCandidateDraft, "markdown">): string {
  const acceptance = draft.acceptanceCriteria.map((item) => `- ${item}`).join("\n");
  const evidence = draft.evidenceLines.join("\n");

  return [
    `# ${draft.title}`,
    "",
    `**Severity / Category:** ${draft.severityLabel} / ${draft.categoryLabel}`,
    `**Priority:** ${draft.priorityLabel}`,
    `**Source:** ${draft.evidenceLines.find((line) => line.startsWith("- Nguồn:"))?.replace("- Nguồn: ", "") ?? "—"}`,
    `**Recommended Linear project:** ${draft.recommendedProject}`,
    "",
    "> **Owner review required before issue creation.**",
    "> Đây chỉ là bản nháp. Chưa tạo Linear issue.",
    "",
    "## Raw feedback summary",
    draft.rawSummary,
    "",
    "## Analyst notes",
    draft.analystNotes,
    "",
    "## Evidence / source",
    evidence,
    "",
    "## Suggested acceptance criteria",
    acceptance,
    "",
    "## Duplicate hints",
    formatDuplicateSection(draft.duplicateHints),
    "",
    "---",
    "_Generated from Vietnamese Eden feedback inbox. Paste into Linear manually. No API call was made._",
  ].join("\n");
}

export function buildLinearCandidateDraft(
  entry: FeedbackEntryRow,
  allEntries: FeedbackEntryRow[],
): LinearCandidateDraft {
  const duplicateHints = findDuplicateHints(entry, allEntries);
  const acceptanceCriteria = suggestedAcceptanceCriteria(entry.category);

  const base: Omit<LinearCandidateDraft, "markdown"> = {
    title: suggestLinearTitle(entry),
    severityLabel: resolveSeverityLabel(entry),
    categoryLabel: labelForCategory(entry.category),
    priorityLabel: labelForPriority(entry.priority),
    rawSummary: entry.raw_summary.trim(),
    analystNotes: buildAnalystNotes(entry),
    evidenceLines: buildEvidenceLines(entry),
    acceptanceCriteria,
    duplicateHints,
    recommendedProject: RECOMMENDED_LINEAR_PROJECT,
  };

  return {
    ...base,
    markdown: buildLinearCandidateMarkdown(base),
  };
}
