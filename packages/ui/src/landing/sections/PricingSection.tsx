import { Check } from "lucide-react";
import type { LPLocale, LPPricing, LPPricingPlan } from "../types";
import { pricingLabels, type PricingLabels } from "./section-labels";
import { SectionHeading } from "./SectionHeading";

export interface PricingSectionProps {
  pricing: LPPricing;
  /** Defaults to "料金プラン" / "Pricing" by locale. Pass "" to hide. */
  heading?: string;
  description?: string;
  /** Anchor id for in-page links. */
  id?: string;
  /** Language for built-in UI text. Defaults to "en". */
  locale?: LPLocale;
  /** Overrides individual built-in UI strings. */
  labels?: Partial<PricingLabels>;
}

function PlanCard({
  plan,
  variant,
  badge,
  fallbackCta,
}: {
  plan: LPPricingPlan;
  variant: "single" | "bundle";
  badge?: string;
  fallbackCta: string;
}) {
  const bundle = variant === "bundle";

  return (
    <li
      className={`flex flex-col justify-between rounded-lg p-6 ${
        bundle ? "border border-primary/40 bg-card/80" : "border border-border/40 bg-card/50"
      }`}
    >
      <div>
        {badge ? (
          <span className="mb-2 inline-block w-fit rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {badge}
          </span>
        ) : null}
        <h3 className="text-base font-semibold">{plan.name}</h3>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight tabular-nums">{plan.price}</span>
          {plan.period ? <span className="text-sm text-muted-foreground">{plan.period}</span> : null}
        </p>
        <ul className="mt-6 flex flex-col gap-2.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={plan.ctaHref ?? "#"}
        className={`mt-8 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm transition-colors ${
          bundle
            ? "bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            : "border border-border/40 bg-muted/30 text-foreground hover:bg-muted"
        }`}
      >
        {plan.ctaLabel ?? fallbackCta}
      </a>
    </li>
  );
}

/** Single product plan next to the Suite bundle. Two columns from md up. */
export function PricingSection({
  pricing,
  heading,
  description,
  id = "pricing",
  locale = "en",
  labels,
}: PricingSectionProps) {
  const text = { ...pricingLabels[locale], ...labels };

  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <SectionHeading heading={heading ?? text.heading} description={description} />
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <PlanCard plan={pricing.singlePlan} variant="single" fallbackCta={text.singleCta} />
        <PlanCard plan={pricing.bundlePlan} variant="bundle" badge={text.bundleBadge} fallbackCta={text.bundleCta} />
      </ul>
    </section>
  );
}
