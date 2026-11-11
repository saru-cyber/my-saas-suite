import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { routing } from "../../i18n/routing";
import type { LegalTab } from "./documents";

export async function redirectLegalTab(params: Promise<{ locale: string }>, tab: LegalTab): Promise<never> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  redirect(`/${locale}/legal?tab=${tab}`);
}
