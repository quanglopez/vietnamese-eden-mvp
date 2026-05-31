import {
  remixVariantsSchema,
  type RemixVariantsResult,
} from "@/lib/ai/prompts/remix";
import type { RemixGeneratorProvider, RemixProviderInput } from "@/lib/ai/types";
import { getRemixFormatLabel, getRemixToneLabel } from "@/lib/remix/constants";

export class MockRemixGeneratorProvider implements RemixGeneratorProvider {
  readonly name = "mock-dev-remix";

  async generateVariants(input: RemixProviderInput): Promise<RemixVariantsResult> {
    const formatLabel = getRemixFormatLabel(input.format);
    const toneLabel = getRemixToneLabel(input.tone);
    const snippet = input.rawContent.trim().slice(0, 80);

    const variants = Array.from({ length: input.variantCount }, (_, index) => {
      const n = index + 1;
      return {
        title: `${formatLabel} — ${toneLabel} #${n}`,
        content: [
          `[MOCK ${formatLabel} · ${toneLabel} · Biến thể ${n}]`,
          "",
          snippet ? `Mở đầu: ${snippet}…` : "Nội dung remix mẫu cho dev.",
          "",
          input.analysis
            ? `Góc: ${input.analysis.angle.slice(0, 120)}…`
            : "Dựa trên nội dung gốc.",
          "",
          `CTA: Bình luận "${n}" để nhận thêm tài liệu.`,
        ].join("\n"),
      };
    });

    return remixVariantsSchema.parse({ variants });
  }
}
