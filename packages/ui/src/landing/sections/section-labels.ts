import type { LPLocale } from "../types";

export interface PricingLabels {
  heading: string;
  bundleBadge: string;
  singleCta: string;
  bundleCta: string;
}

export interface FaqLabels {
  heading: string;
}

export const pricingLabels: Record<LPLocale, PricingLabels> = {
  ja: { heading: "料金プラン", bundleBadge: "Suite バンドル", singleCta: "始める", bundleCta: "バンドルを始める" },
  en: { heading: "Pricing", bundleBadge: "Suite bundle", singleCta: "Get started", bundleCta: "Get the bundle" },
};

export const faqLabels: Record<LPLocale, FaqLabels> = {
  ja: { heading: "よくある質問" },
  en: { heading: "FAQ" },
};

export interface LandingHeadings {
  features: string;
  steps: string;
  caseStudies: string;
  pricing: string;
  faqs: string;
}

/** Default section headings used by SuiteLandingPage. */
export const landingHeadings: Record<LPLocale, LandingHeadings> = {
  ja: {
    features: "主な機能",
    steps: "導入の流れ",
    caseStudies: "導入事例",
    pricing: pricingLabels.ja.heading,
    faqs: faqLabels.ja.heading,
  },
  en: {
    features: "Features",
    steps: "How it works",
    caseStudies: "Customer stories",
    pricing: pricingLabels.en.heading,
    faqs: faqLabels.en.heading,
  },
};
