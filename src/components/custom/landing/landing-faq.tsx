import { FAQ_ITEMS } from "@/components/custom/landing/landing-content";

export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-surface px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">
          Câu hỏi thường gặp
        </h2>
        <dl className="mt-10 space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-border/60 bg-surface-elev p-5"
            >
              <dt className="font-display font-semibold">{item.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
