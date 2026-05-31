import { USE_CASES } from "@/components/custom/landing/landing-content";

export function LandingUseCases() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">
          Ai đang dùng?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Use case phổ biến trong beta creator & agency Việt Nam.
        </p>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {USE_CASES.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-dashed border-brand/30 bg-surface p-6"
            >
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
