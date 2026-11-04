import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "../../../../i18n/routing";
import { readSettings, toAuthView, toBillingView } from "../../../../src/settings/store";
import { SettingsConsole } from "./_components/SettingsConsole";

export const dynamic = "force-dynamic";

function callbackOrigin(headerList: Headers): string {
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  return { title: t("metaTitle") };
}

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [settings, headerList] = await Promise.all([readSettings(), headers()]);
  const callbackUrl = `${callbackOrigin(headerList)}/api/auth/google/callback`;

  return (
    <SettingsConsole
      auth={toAuthView(settings.auth)}
      billing={toBillingView(settings.billing)}
      appearance={settings.appearance}
      callbackUrl={callbackUrl}
    />
  );
}
