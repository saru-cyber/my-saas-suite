import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { SuiteFooter } from "@my-saas-suite/ui/footer";
import { SuiteHeader } from "@my-saas-suite/ui/header";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { routing } from "../../i18n/routing";
import { SESSION_COOKIE_NAME, verifySession } from "../../src/auth/session";
import { appearanceDocumentProps } from "../../src/settings/appearance";
import { isHttpLogoUrl, readAppearanceSettings } from "../../src/settings/store";
import { suiteSite } from "../../src/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("metadata");
  return { title: t("title") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, appearance] = await Promise.all([getMessages(), readAppearanceSettings()]);
  const theme = appearanceDocumentProps(appearance);
  const showLogo = appearance.logoUrl.length > 0 && isHttpLogoUrl(appearance.logoUrl);
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const isLoggedIn = token ? verifySession(token) !== null : false;

  return (
    <html lang={locale} className={theme.className} style={theme.style}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SuiteHeader
            brandName={suiteSite.suiteName}
            logoUrl={showLogo ? appearance.logoUrl : undefined}
            currentLocale={locale}
            isLoggedIn={isLoggedIn}
          />
          <div className="flex-1">{children}</div>
          <SuiteFooter currentLocale={locale} suiteName={suiteSite.suiteName} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
