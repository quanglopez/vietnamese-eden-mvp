import { CORE_FEATURES } from "@/components/custom/landing/landing-content";

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 bg-gradient-brand-soft px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">
          Tính năng cốt lõi
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Toàn bộ luồng MVP: board → breakdown → remix → voice → calendar.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl border border-border/60 bg-surface-elev p-6 shadow-card"
            >
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
