import { isLegalSlug, legalSlugForTab } from "@my-saas-suite/legal";
import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { routing } from "../../i18n/routing";

export async function redirectLegalTab(params: Promise<{ locale: string }>, tab: string): Promise<never> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const slug = isLegalSlug(tab) ? tab : (legalSlugForTab(tab) ?? "terms");
  redirect(`/${locale}/legal/${slug}`);
}
