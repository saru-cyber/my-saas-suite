export type FooterLocale = "en" | "ja";

export interface FooterLabels {
  legal: string;
  languageNav: string;
  rights: string;
}

export const footerLabels: Record<FooterLocale, FooterLabels> = {
  ja: {
    legal: "法務情報",
    languageNav: "言語",
    rights: "All rights reserved.",
  },
  en: {
    legal: "Legal",
    languageNav: "Language",
    rights: "All rights reserved.",
  },
};
