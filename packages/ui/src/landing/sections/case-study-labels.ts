import type { LPLocale } from "../types";

export interface CaseStudyLabels {
  readMore: string;
  before: string;
  after: string;
  voice: string;
  close: string;
}

export const caseStudyLabels: Record<LPLocale, CaseStudyLabels> = {
  ja: {
    readMore: "詳しく見る",
    before: "導入前の課題",
    after: "導入後の変化",
    voice: "担当者の声",
    close: "閉じる",
  },
  en: {
    readMore: "Read the story",
    before: "Before",
    after: "After",
    voice: "In their words",
    close: "Close",
  },
};
