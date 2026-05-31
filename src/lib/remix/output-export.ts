import {
  formatOutputCreatedAt,
  getOutputDisplayTitle,
  getOutputStatusLabel,
  slugifyFilename,
} from "@/lib/remix/output-display";
import type { GeneratedOutputView } from "@/types/remix";

const OUTPUT_SEPARATOR = "\n\n────────────────────────────────\n\n";

export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard không khả dụng trong môi trường này.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!ok) {
    throw new Error("Trình duyệt không cho phép copy. Hãy copy thủ công.");
  }
}

function formatOutputBlockPlain(output: GeneratedOutputView, index?: number): string {
  const prefix = typeof index === "number" ? `Biến thể ${index + 1}: ` : "";
  return [
    `${prefix}${getOutputDisplayTitle(output)}`,
    `Format: ${output.formatLabel}`,
    `Tone: ${output.toneLabel}`,
    `Trạng thái: ${getOutputStatusLabel(output.status)}`,
    `Tạo lúc: ${formatOutputCreatedAt(output.createdAt)}`,
    "",
    output.content,
  ].join("\n");
}

export function buildAllOutputsPlainText(outputs: GeneratedOutputView[]): string {
  return outputs
    .map((output, index) => formatOutputBlockPlain(output, index))
    .join(OUTPUT_SEPARATOR);
}

export function buildSingleOutputPlainText(output: GeneratedOutputView): string {
  return formatOutputBlockPlain(output);
}

export function buildSingleOutputMarkdown(output: GeneratedOutputView): string {
  const title = getOutputDisplayTitle(output);
  return [
    `# ${title}`,
    "",
    `- **Format:** ${output.formatLabel}`,
    `- **Tone:** ${output.toneLabel}`,
    `- **Trạng thái:** ${getOutputStatusLabel(output.status)}`,
    `- **Tạo lúc:** ${formatOutputCreatedAt(output.createdAt)}`,
    "",
    output.content,
  ].join("\n");
}

export function buildAllOutputsMarkdown(
  outputs: GeneratedOutputView[],
  sourceTitle: string,
): string {
  const header = [`# Remix outputs — ${sourceTitle}`, "", `Tổng: ${outputs.length} biến thể`, ""].join(
    "\n",
  );

  const sections = outputs.map((output, index) => {
    const title = getOutputDisplayTitle(output);
    return [
      `## Biến thể ${index + 1}: ${title}`,
      "",
      `- **Format:** ${output.formatLabel}`,
      `- **Tone:** ${output.toneLabel}`,
      `- **Trạng thái:** ${getOutputStatusLabel(output.status)}`,
      `- **Tạo lúc:** ${formatOutputCreatedAt(output.createdAt)}`,
      "",
      output.content,
    ].join("\n");
  });

  return `${header}${sections.join("\n\n---\n\n")}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function getSingleOutputTxtFilename(output: GeneratedOutputView): string {
  return `${slugifyFilename(getOutputDisplayTitle(output))}.txt`;
}

export function getSingleOutputMdFilename(output: GeneratedOutputView): string {
  return `${slugifyFilename(getOutputDisplayTitle(output))}.md`;
}

export function getAllOutputsTxtFilename(sourceTitle: string): string {
  return `remix-all-${slugifyFilename(sourceTitle)}.txt`;
}

export function getAllOutputsMdFilename(sourceTitle: string): string {
  return `remix-all-${slugifyFilename(sourceTitle)}.md`;
}
