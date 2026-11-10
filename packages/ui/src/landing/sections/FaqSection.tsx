"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { LPFaq, LPLocale } from "../types";
import { faqLabels } from "./section-labels";
import { SectionHeading } from "./SectionHeading";

export interface FaqSectionProps {
  faqs: LPFaq[];
  /** Defaults to "よくある質問" / "FAQ" by locale. Pass "" to hide. */
  heading?: string;
  description?: string;
  /** Anchor id for in-page links. */
  id?: string;
  /** Language for the default heading. Defaults to "en". */
  locale?: LPLocale;
}

/**
 * In-place accordion. Each item opens independently; the answer expands with a
 * 200ms ease-out height transition (grid-rows 0fr → 1fr) and the chevron turns 180°.
 * Collapsed answers are `inert`, so they are skipped by keyboard and screen readers.
 */
export function FaqSection({ faqs, heading, description, id = "faq", locale = "en" }: FaqSectionProps) {
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(() => new Set());
  const baseId = useId();

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <SectionHeading heading={heading ?? faqLabels[locale].heading} description={description} />
      <ul className="mx-auto max-w-3xl divide-y divide-border/30 border-y border-border/40">
        {faqs.map((faq, index) => {
          const open = openItems.has(index);
          const buttonId = `${baseId}-q${index}`;
          const panelId = `${baseId}-a${index}`;
          return (
            <li key={faq.question}>
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pt-2 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
