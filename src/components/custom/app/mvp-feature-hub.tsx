import Link from "next/link";
import { ArrowRight, FolderHeart } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";

type MvpFeatureHubProps = {
  title: string;
  subtitle: string;
  description: string;
  steps: string[];
};

export function MvpFeatureHub({ title, subtitle, description, steps }: MvpFeatureHubProps) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-2xl">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>

        <ol className="mt-6 space-y-2 text-sm list-decimal list-inside text-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Button asChild className="mt-8 gap-2 bg-foreground text-background">
          <Link href="/boards">
            <FolderHeart className="h-4 w-4" />
            Mở bảng cảm hứng
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
