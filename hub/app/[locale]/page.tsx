import { SuiteLandingPage } from "@my-saas-suite/ui/landing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getHubLpContent } from "../../config/lp-content";
import { routing } from "../../i18n/routing";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // The locale layout already renders SuiteFooter on every page.
  return <SuiteLandingPage content={getHubLpContent(locale)} locale={locale} showFooter={false} />;
}
