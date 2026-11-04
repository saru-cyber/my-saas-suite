import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "../../components/LocaleSwitcher";
import { routing } from "../../i18n/routing";
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

  return (
    <html lang={locale} className={theme.className} style={theme.style}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className={`flex items-center gap-4 px-6 pt-4 md:px-8 ${showLogo ? "justify-between" : "justify-end"}`}>
            {showLogo ? (
              <img src={appearance.logoUrl} alt={suiteSite.suiteName} className="h-8 max-w-40 object-contain" />
            ) : null}
            <LocaleSwitcher />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
