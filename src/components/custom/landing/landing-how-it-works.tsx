import { HOW_IT_WORKS_STEPS } from "@/components/custom/landing/landing-content";

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">
          Cách hoạt động
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Bốn bước từ lưu bài viral đến output sẵn sàng đăng.
        </p>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <li
              key={item.step}
              className="relative rounded-2xl border border-border/60 bg-surface-elev p-6"
            >
              <span className="font-display text-3xl font-bold text-gradient-brand">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
