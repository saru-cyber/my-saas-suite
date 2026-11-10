import type { LPStep } from "../types";
import { SectionHeading, type SectionHeadingProps } from "./SectionHeading";

export interface HowItWorksProps extends SectionHeadingProps {
  steps: LPStep[];
  /** Anchor id for in-page links. */
  id?: string;
}

/** Three horizontal steps from md up, stacked on mobile. */
export function HowItWorks({ steps, id = "how-it-works", heading, description }: HowItWorksProps) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <SectionHeading heading={heading} description={description} />
      <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step) => (
          <li key={step.stepNumber} className="flex flex-col border-t border-border/40 pt-6">
            <span className="w-fit rounded border border-border/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {step.stepNumber}
            </span>
            <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
