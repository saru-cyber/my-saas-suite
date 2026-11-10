import type { ReactNode } from "react";
import type { LPHero } from "../types";

export interface LandingHeroProps {
  hero: LPHero;
  /** Product UI shown in the flat preview frame. Defaults to a skeleton mock. */
  preview?: ReactNode;
}

const ROW_WIDTHS = ["w-11/12", "w-3/4", "w-3/5", "w-2/5"];

function PreviewMock() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-[264px] flex-col gap-3 rounded-lg bg-background/60 p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-muted" />
        <span className="size-2 rounded-full bg-muted" />
        <span className="size-2 rounded-full bg-muted" />
        <span className="ml-3 h-2 w-32 rounded bg-muted" />
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-3">
        <div className="flex flex-col gap-2 rounded-md border border-border/40 p-3">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-2 rounded bg-muted ${i === 0 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 rounded-md border border-border/40 p-3">
                <span className="h-2 w-1/2 rounded bg-muted" />
                <span className="h-4 w-3/4 rounded bg-primary/20" />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-md border border-border/40 p-3">
            {ROW_WIDTHS.map((width) => (
              <span key={width} className={`h-2 rounded bg-muted ${width}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero({ hero, preview }: LandingHeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pt-24 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="rounded-full border border-border/40 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
          {hero.badge}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{hero.title}</h1>
        <p className="mt-5 text-base text-pretty text-muted-foreground sm:text-lg">{hero.subtitle}</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href={hero.primaryCta.href ?? "#"}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href ?? "#"}
            className="inline-flex items-center justify-center rounded-md border border-border/40 bg-muted/20 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>
      <div className="mt-14 min-h-[280px] rounded-xl border border-border/40 bg-card/40 p-2">
        {preview ?? <PreviewMock />}
      </div>
    </section>
  );
}
