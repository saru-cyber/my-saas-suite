export const LEGAL_SLUGS = ["terms", "privacy", "tokushoho", "specified-electronic-mail"] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalLocale = "en" | "ja";

export interface LegalDocument {
  slug: LegalSlug;
  locale: LegalLocale;
  title: string;
  effectiveDate: string;
  updatedAt: string;
  body: string;
}

export interface LegalChrome {
  disclaimer: string;
  effectiveDate: string;
  updatedAt: string;
  navLabel: string;
}

const LEGACY_TABS = {
  terms: "terms",
  privacy: "privacy",
  merchant: "tokushoho",
  email: "specified-electronic-mail",
} as const;

export function isLegalSlug(value: string): value is LegalSlug {
  return LEGAL_SLUGS.some((slug) => slug === value);
}

export function isLegalLocale(value: string): value is LegalLocale {
  return value === "en" || value === "ja";
}

/** Maps the old `?tab=` values onto the markdown document slugs. */
export function legalSlugForTab(tab: string | undefined): LegalSlug | null {
  if (!tab) {
    return null;
  }
  if (isLegalSlug(tab)) {
    return tab;
  }
  if (Object.prototype.hasOwnProperty.call(LEGACY_TABS, tab)) {
    return LEGACY_TABS[tab as keyof typeof LEGACY_TABS];
  }
  return null;
}

export const legalChrome: Record<LegalLocale, LegalChrome> = {
  ja: {
    disclaimer:
      "⚠️ 本ドキュメントはプロトタイプ用の参考資料であり、本番運用時は弁護士等の専門家によるリーガルチェックが必要です。",
    effectiveDate: "施行日",
    updatedAt: "最終更新日",
    navLabel: "法務文書",
  },
  en: {
    disclaimer:
      "⚠️ This document is a prototype reference. A legal review by a qualified attorney is required before production use.",
    effectiveDate: "Effective date",
    updatedAt: "Updated",
    navLabel: "Legal documents",
  },
};
