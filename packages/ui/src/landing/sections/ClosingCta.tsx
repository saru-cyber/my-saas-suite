import type { LPClosingCta } from "../types";

export interface ClosingCtaProps {
  closingCta: LPClosingCta;
  /** Anchor id for in-page links. */
  id?: string;
}

/** Final flat sign-up banner near the bottom of the page. */
export function ClosingCta({ closingCta, id = "cta" }: ClosingCtaProps) {
  return (
    <section id={id} className="scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <div className="mx-auto max-w-5xl rounded-xl border border-border/40 bg-card/40 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{closingCta.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-pretty text-muted-foreground">{closingCta.subtitle}</p>
        <a
          href={closingCta.buttonHref ?? "#"}
          className="mt-6 inline-flex rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {closingCta.buttonLabel}
        </a>
      </div>
    </section>
  );
}
