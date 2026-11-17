import { legalSlugForTab } from "@my-saas-suite/legal";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { routing } from "../../../i18n/routing";

function readTab(value: string | string[] | undefined): string | undefined {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab || undefined;
}

export default async function LegalIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const slug = legalSlugForTab(readTab((await searchParams).tab)) ?? "terms";
  redirect(`/${locale}/legal/${slug}`);
}
