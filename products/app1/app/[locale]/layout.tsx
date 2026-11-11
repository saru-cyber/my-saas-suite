import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { app1Origin, SuiteFooter } from "@my-saas-suite/ui/footer";
import { SuiteHeader } from "@my-saas-suite/ui/header";
import { routing } from "../../i18n/routing";
import { hasProductAccess, SESSION_COOKIE_NAME, verifySessionToken } from "../../src/auth/session";
import { productSite, readHubUrl } from "../../src/site";

/** "Open dashboard" only makes sense for users the dashboard will actually let in. */
async function canOpenDashboard(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token) : null;
  return claims !== null && hasProductAccess(claims);
}

const DUMMY_GA_MEASUREMENT_ID = "G-YOUR_GA_ID";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("metadata");
  return {
    title: t("title"),
    verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  };
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
  const [messages, isLoggedIn] = await Promise.all([getMessages(), canOpenDashboard()]);

  return (
    <html lang={locale}>
      <body className="bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <SuiteHeader
              brandName={productSite.productName}
              currentLocale={locale}
              hubUrl={readHubUrl()}
              isLoggedIn={isLoggedIn}
            />
            <div className="flex-1">{children}</div>
            <SuiteFooter
              currentLocale={locale}
              hubUrl={readHubUrl()}
              suiteName={productSite.suiteName}
              activeHref={app1Origin()}
            />
          </div>
        </NextIntlClientProvider>
      </body>
      {gaMeasurementId && gaMeasurementId !== DUMMY_GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={gaMeasurementId} />
      ) : null}
    </html>
  );
}
