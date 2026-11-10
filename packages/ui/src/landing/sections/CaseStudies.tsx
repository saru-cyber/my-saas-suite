"use client";

import { useCallback, useState } from "react";
import type { LPCaseStudy, LPLocale } from "../types";
import { caseStudyLabels, type CaseStudyLabels } from "./case-study-labels";
import { CaseStudyModal } from "./CaseStudyModal";
import { SectionHeading, type SectionHeadingProps } from "./SectionHeading";

export interface CaseStudiesProps extends SectionHeadingProps {
  caseStudies: LPCaseStudy[];
  /** Anchor id for in-page links (the default hero secondary CTA targets it). */
  id?: string;
  /** Language for built-in UI text ("Read more", "Before/After", "Close"). Defaults to "en". */
  locale?: LPLocale;
  /** Overrides individual built-in UI strings. */
  labels?: Partial<CaseStudyLabels>;
}

export function CaseStudies({
  caseStudies,
  id = "case-studies",
  heading,
  description,
  locale = "en",
  labels,
}: CaseStudiesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const close = useCallback(() => setSelectedId(null), []);
  const text = { ...caseStudyLabels[locale], ...labels };
  const selectedStudy = caseStudies.find((study) => study.id === selectedId) ?? null;

  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <SectionHeading heading={heading} description={description} />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {caseStudies.map((study) => (
          <li key={study.id} className="flex">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setSelectedId(study.id)}
              className="flex w-full cursor-pointer flex-col rounded-lg border border-border/40 bg-card/50 p-6 text-left transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="text-base font-semibold">{study.company}</span>
              <span className="mt-2 w-fit rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {study.industry}
              </span>
              <span className="mt-3 text-lg font-bold text-primary">{study.metric}</span>
              <span className="mt-2 line-clamp-3 text-sm text-muted-foreground">{study.challenge}</span>
              <span className="mt-auto pt-4 text-sm font-medium">
                {text.readMore} <span aria-hidden="true">→</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <CaseStudyModal study={selectedStudy} onClose={close} labels={text} />
    </section>
  );
}
