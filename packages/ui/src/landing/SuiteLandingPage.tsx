import type { ReactNode } from "react";
import { SuiteFooter } from "../footer";
import { SuiteHeader, type SuiteHeaderProps } from "../header";
import {
  CaseStudies,
  ClosingCta,
  FaqSection,
  FeatureGrid,
  HowItWorks,
  KeyMetrics,
  LandingHero,
  PricingSection,
} from "./sections";
import { landingHeadings, type LandingHeadings } from "./sections/section-labels";
import type { LPContent, LPLocale } from "./types";

export interface SuiteLandingPageProps {
  /** Every piece of LP copy. Apps keep this in `config/lp-content.ts`. */
  content: LPContent;
  locale: LPLocale;
  /** Hub origin for the footer's legal links. Defaults to NEXT_PUBLIC_HUB_URL. */
  hubUrl?: string;
  /** Suite name shown in the footer copyright. */
  suiteName?: string;
  /** Real product UI for the hero preview frame. Defaults to a skeleton mock. */
  previewSlot?: ReactNode;
  /**
   * Renders SuiteHeader above the hero with these props (locale and hubUrl are filled in).
   * Leave unset when the app layout already renders SuiteHeader, as the Hub and App1 do.
   */
  header?: Omit<SuiteHeaderProps, "currentLocale">;
  /** Render SuiteFooter at the bottom. Set false when the layout already renders it. */
  showFooter?: boolean;
  /** Overrides the default per-locale section headings. Pass "" to hide one. */
  sectionHeadings?: Partial<LandingHeadings>;
}

/**
 * The shared eight-section LP (requirementsadd2.md §2). Pages only pass content;
 * section order, layout and styling live here.
 */
export function SuiteLandingPage({
  content,
  locale,
  hubUrl,
  suiteName,
  previewSlot,
  header,
  showFooter = true,
  sectionHeadings,
}: SuiteLandingPageProps) {
  const headings = { ...landingHeadings[locale], ...sectionHeadings };

  return (
    <>
      {header ? <SuiteHeader hubUrl={hubUrl} {...header} currentLocale={locale} /> : null}
      <main>
        <LandingHero hero={content.hero} preview={previewSlot} />
        <KeyMetrics metrics={content.metrics} />
        <FeatureGrid features={content.features} heading={headings.features} />
        <HowItWorks steps={content.steps} heading={headings.steps} />
        <CaseStudies caseStudies={content.caseStudies} locale={locale} heading={headings.caseStudies} />
        <PricingSection pricing={content.pricing} locale={locale} heading={headings.pricing} />
        <FaqSection faqs={content.faqs} locale={locale} heading={headings.faqs} />
        <ClosingCta closingCta={content.closingCta} />
      </main>
      {showFooter ? <SuiteFooter currentLocale={locale} hubUrl={hubUrl} suiteName={suiteName} /> : null}
    </>
  );
}
