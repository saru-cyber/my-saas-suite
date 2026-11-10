/**
 * Shared landing-page (LP) content contract for the Hub and every product app.
 *
 * Spec: requirementsadd2.md §4.2. Each app keeps a single `config/lp-content.ts`
 * that exports an `LPContent` value; the shared LP template renders all eight
 * sections from it, so changing copy never requires touching page components.
 */

export type LPLocale = "en" | "ja";

export interface LPLink {
  label: string;
  /** Absolute URL, app-relative path, or in-page anchor (e.g. `#pricing`). */
  href?: string;
}

/** ① Hero */
export interface LPHero {
  /** Category / highlight badge shown above the title. */
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: LPLink;
  secondaryCta: LPLink;
}

/** ② Key metrics / social proof (3–4 items). */
export interface LPMetric {
  value: string;
  label: string;
}

/** ③ Feature grid (3–6 items). */
export interface LPFeature {
  title: string;
  description: string;
  /** lucide-react icon name in PascalCase, e.g. `"Workflow"`. */
  iconName: string;
}

/** ④ How it works (3 steps). */
export interface LPStep {
  /** Display label such as `"01"`. */
  stepNumber: string;
  title: string;
  description: string;
}

/** ⑤ Case study card + in-place detail modal. */
export interface LPCaseStudy {
  /** Stable key, unique within the list. */
  id: string;
  company: string;
  /** Industry badge text. */
  industry: string;
  /** Outcome highlight shown on the card, e.g. "月間作業時間を40時間削減". */
  metric: string;
  /** Before: the problem prior to adoption. */
  challenge: string;
  /** After: how it was solved and the result. */
  solution: string;
  /** Interview excerpt / customer comment. */
  quote: string;
  /** Role and name of the person quoted. */
  author: string;
}

/** ⑥ A pricing plan summary. */
export interface LPPricingPlan {
  name: string;
  /** Pre-formatted price string, e.g. "¥4,980" or "$39". */
  price: string;
  /** Billing period suffix, e.g. "/ 月" or "/ month". */
  period?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

/** ⑥ Single product plan vs Suite bundle. */
export interface LPPricing {
  singlePlan: LPPricingPlan;
  bundlePlan: LPPricingPlan;
}

/** ⑦ FAQ accordion item. */
export interface LPFaq {
  question: string;
  answer: string;
}

/** ⑧ Closing CTA banner. */
export interface LPClosingCta {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref?: string;
}

export interface LPContent {
  hero: LPHero;
  metrics: LPMetric[];
  features: LPFeature[];
  steps: LPStep[];
  caseStudies: LPCaseStudy[];
  pricing: LPPricing;
  faqs: LPFaq[];
  closingCta: LPClosingCta;
}

/** One `LPContent` per supported locale. */
export type LPContentByLocale = Record<LPLocale, LPContent>;
