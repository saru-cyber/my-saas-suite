export type FooterLocale = "en" | "ja";

export interface FooterLabels {
  legal: string;
  languageNav: string;
  rights: string;
  suiteMenu: string;
  suiteAccount: string;
  app1: string;
  devPortal: string;
}

export const footerLabels: Record<FooterLocale, FooterLabels> = {
  ja: {
    legal: "利用規約等",
    languageNav: "言語",
    rights: "All rights reserved.",
    suiteMenu: "Suite",
    suiteAccount: "Suite マイページ",
    app1: "App 1",
    devPortal: "開発者ポータル",
  },
  en: {
    legal: "Legal",
    languageNav: "Language",
    rights: "All rights reserved.",
    suiteMenu: "Suite",
    suiteAccount: "Suite account",
    app1: "App 1",
    devPortal: "Developer portal",
  },
};
