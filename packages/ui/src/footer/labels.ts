export type FooterLocale = "en" | "ja";

export interface FooterLabels {
  legalNav: string;
  terms: string;
  privacy: string;
  tokushoho: string;
  email: string;
  languageNav: string;
  rights: string;
  suiteMenu: string;
  suiteAccount: string;
  app1: string;
  devPortal: string;
}

export const footerLabels: Record<FooterLocale, FooterLabels> = {
  ja: {
    legalNav: "法務文書",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    tokushoho: "特定商取引法に基づく表記",
    email: "特定電子メール法に基づく表記",
    languageNav: "言語",
    rights: "All rights reserved.",
    suiteMenu: "Suite",
    suiteAccount: "Suite マイページ",
    app1: "App 1",
    devPortal: "開発者ポータル",
  },
  en: {
    legalNav: "Legal documents",
    terms: "Terms",
    privacy: "Privacy",
    tokushoho: "Commercial disclosure",
    email: "Commercial email",
    languageNav: "Language",
    rights: "All rights reserved.",
    suiteMenu: "Suite",
    suiteAccount: "Suite account",
    app1: "App 1",
    devPortal: "Developer portal",
  },
};
