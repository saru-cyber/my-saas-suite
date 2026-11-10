"use client";

import { useEffect, useId, useRef } from "react";
import type { LPCaseStudy } from "../types";
import type { CaseStudyLabels } from "./case-study-labels";

export interface CaseStudyModalProps {
  /** The study to show; `null` keeps the modal closed. */
  study: LPCaseStudy | null;
  onClose: () => void;
  labels: CaseStudyLabels;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Locks page scroll while mounted, compensating for the scrollbar so the layout doesn't shift. */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const { body, documentElement } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [active]);
}

/**
 * In-place case study detail: centered dialog from md up, bottom sheet below.
 * Closes on backdrop click, Esc, or the close button; focus is trapped while open
 * and returned to the triggering card on close.
 */
export function CaseStudyModal({ study, onClose, labels }: CaseStudyModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const open = study !== null;

  useScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open, onClose]);

  if (!study) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-out starting:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-xl border-x border-t border-border/40 bg-background p-6 transition-[translate,opacity] duration-200 ease-out starting:translate-y-full md:max-w-xl md:rounded-xl md:border md:starting:translate-y-2 md:starting:opacity-0"
      >
        <div className="mx-auto -mt-2 mb-4 h-1 w-10 rounded-full bg-muted md:hidden" aria-hidden="true" />
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {study.company}
            </h2>
            <span className="w-fit rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{study.industry}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <span aria-hidden="true">✕</span>
            <kbd className="hidden font-mono md:inline">Esc</kbd>
          </button>
        </header>

        <p className="mt-6 text-2xl font-bold tracking-tight text-primary">{study.metric}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          <section className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="text-xs font-medium text-muted-foreground">{labels.before}</h3>
            <p className="mt-2 text-sm">{study.challenge}</p>
          </section>
          <span aria-hidden="true" className="self-center justify-self-center text-muted-foreground max-md:rotate-90">
            →
          </span>
          <section className="rounded-lg border border-border/40 bg-card/60 p-4">
            <h3 className="text-xs font-medium text-muted-foreground">{labels.after}</h3>
            <p className="mt-2 text-sm">{study.solution}</p>
          </section>
        </div>

        <figure className="mt-6 border-t border-border/40 pt-6">
          <h3 className="text-xs font-medium text-muted-foreground">{labels.voice}</h3>
          <blockquote className="mt-3 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed">{study.quote}</blockquote>
          <figcaption className="mt-3 text-xs text-muted-foreground">— {study.author}</figcaption>
        </figure>
      </div>
    </div>
  );
}
