export type FooterLocale = "en" | "ja";

export interface FooterLabels {
  legalNav: string;
  terms: string;
  merchant: string;
  privacy: string;
  languageNav: string;
  rights: string;
}

export const footerLabels: Record<FooterLocale, FooterLabels> = {
  ja: {
    legalNav: "法的情報",
    terms: "利用規約",
    merchant: "特定商取引法に基づく表記",
    privacy: "プライバシーポリシー",
    languageNav: "言語",
    rights: "All rights reserved.",
  },
  en: {
    legalNav: "Legal",
    terms: "Terms of Service",
    merchant: "Specified Commercial Transactions Act",
    privacy: "Privacy Policy",
    languageNav: "Language",
    rights: "All rights reserved.",
  },
};
