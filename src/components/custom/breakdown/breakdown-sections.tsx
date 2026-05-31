"use client";

import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  Heart,
  Lightbulb,
  ListOrdered,
  Megaphone,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContentAnalysisView } from "@/types/analysis";

type SectionConfig = {
  icon: LucideIcon;
  label: string;
  tag: string;
  color: string;
  body: string;
  note?: string;
};

function buildSections(analysis: ContentAnalysisView): SectionConfig[] {
  return [
    {
      icon: Anchor,
      label: "Hook",
      tag: "0–3 giây",
      color: "from-brand to-brand-2",
      body: analysis.hook,
    },
    {
      icon: Target,
      label: "Angle",
      tag: "Góc nhìn",
      color: "from-brand-2 to-brand-3",
      body: analysis.angle,
    },
    {
      icon: ListOrdered,
      label: "Cấu trúc",
      tag: "Storyline",
      color: "from-brand-3 to-brand-4",
      body: analysis.structure,
    },
    {
      icon: Megaphone,
      label: "CTA",
      tag: "Kêu gọi",
      color: "from-brand-4 to-brand",
      body: analysis.cta,
    },
    {
      icon: Heart,
      label: "Cảm xúc",
      tag: "Emotion",
      color: "from-brand to-brand-3",
      body: analysis.emotion,
    },
    {
      icon: Users,
      label: "Đối tượng mục tiêu",
      tag: "Audience",
      color: "from-brand-2 to-brand-4",
      body: analysis.targetAudience,
    },
    {
      icon: Lightbulb,
      label: "Vì sao hiệu quả",
      tag: "Why it works",
      color: "from-brand to-brand-4",
      body: analysis.whyItWorks,
    },
  ];
}

type BreakdownSectionsProps = {
  analysis: ContentAnalysisView;
};

export function BreakdownSections({ analysis }: BreakdownSectionsProps) {
  const sections = buildSections(analysis);

  return (
    <div className="space-y-4">
      {sections.map(({ icon: Icon, label, tag, color, body }) => (
        <article
          key={label}
          className="rounded-2xl border border-border/60 bg-surface-elev p-6"
        >
          <div className="flex items-start gap-4">
            <div
              className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} grid place-items-center shadow-glow shrink-0`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-lg font-bold">{label}</h3>
                <span className="text-[10px] uppercase tracking-wider text-brand font-semibold bg-brand/10 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
            </div>
          </div>
        </article>
      ))}

      {analysis.remixSuggestions.length > 0 ? (
        <article className="rounded-2xl border border-border/60 bg-surface-elev p-6">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand grid place-items-center shadow-glow shrink-0">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold">Gợi ý Remix</h3>
                <span className="text-[10px] uppercase tracking-wider text-brand font-semibold bg-brand/10 px-2 py-0.5 rounded-full">
                  Remix suggestions
                </span>
              </div>
              <ul className="space-y-2">
                {analysis.remixSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="text-sm text-foreground pl-3 border-l-2 border-brand/40"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

type BreakdownStatusBannerProps = {
  hasAnalysis: boolean;
  aiModel: string | null;
  onReanalyze: () => void;
  isAnalyzing: boolean;
};

export function BreakdownStatusBanner({
  hasAnalysis,
  aiModel,
  onReanalyze,
  isAnalyzing,
}: BreakdownStatusBannerProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-brand-soft p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display font-bold">
            {hasAnalysis ? "Phân tích bằng AI hoàn tất" : "Sẵn sàng phân tích"}
          </div>
          <div className="text-xs text-muted-foreground">
            {aiModel ? `Model: ${aiModel}` : "Chưa có phân tích"}
          </div>
        </div>
      </div>
      <Button
        onClick={onReanalyze}
        disabled={isAnalyzing}
        className="bg-foreground text-background gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {hasAnalysis ? "Phân tích lại" : "Phân tích AI"}
      </Button>
    </div>
  );
}
