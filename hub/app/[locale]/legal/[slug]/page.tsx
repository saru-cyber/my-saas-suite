import { isLegalSlug, LEGAL_SLUGS, LegalDocumentPage, legalDocumentTitle } from "@my-saas-suite/legal";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../../i18n/routing";

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) {
    return {};
  }
  return { title: legalDocumentTitle(locale, slug) };
}

export default async function LegalSlugPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) {
    notFound();
  }
  setRequestLocale(locale);
  return <LegalDocumentPage locale={locale} slug={slug} />;
}
