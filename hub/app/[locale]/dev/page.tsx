import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Link } from "../../../i18n/navigation";
import { routing, type AppLocale } from "../../../i18n/routing";
import { suiteProductHomeUrl, suiteProductLaunchUrl } from "../../../src/products/catalog";

export const dynamic = "force-dynamic";

/**
 * Local navigation only. A production server always returns 404.
 * Set DEV_PORTAL_ENABLED=false to hide the page in development as well.
 */
function isDevPortalEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.DEV_PORTAL_ENABLED !== "false";
}

interface ScreenLink {
  href: string;
  label: string;
  path: string;
  external?: boolean;
  nested?: boolean;
}

function linkClassName(nested: boolean): string {
  const indent = nested ? "pl-8" : "px-3";
  return `flex min-h-11 flex-col items-start justify-center gap-0.5 py-2 ${indent} pr-3 text-sm transition-colors duration-150 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between sm:gap-4`;
}

function ScreenAnchor({ item }: { item: ScreenLink }) {
  const className = linkClassName(item.nested === true);
  const body = (
    <>
      <span>{item.label}</span>
      <span className="font-mono text-xs break-all text-muted-foreground sm:shrink-0 sm:text-right">{item.path}</span>
    </>
  );
  if (item.external) {
    return (
      <a href={item.href} className={className}>
        {body}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isDevPortalEnabled()) {
    return {};
  }
  setRequestLocale(locale);
  const t = await getTranslations("dev");
  return { title: t("title") };
}

export default async function DevPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isDevPortalEnabled()) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("dev");
  const app1Home = suiteProductHomeUrl("app1", locale);
  const app1Dashboard = suiteProductLaunchUrl("app1", locale);
  const hubLinks: ScreenLink[] = [
    { href: "/", label: t("landing"), path: `/${locale}` },
    { href: "/login", label: t("login"), path: `/${locale}/login` },
    { href: "/dashboard", label: t("dashboard"), path: `/${locale}/dashboard` },
    { href: "/admin/settings", label: t("admin"), path: `/${locale}/admin/settings` },
    { href: "/terms", label: t("terms"), path: `/${locale}/terms`, nested: true },
    { href: "/privacy", label: t("privacy"), path: `/${locale}/privacy`, nested: true },
    { href: "/legal/merchant", label: t("merchant"), path: `/${locale}/legal/merchant`, nested: true },
  ];
  const appLinks: ScreenLink[] = [
    { href: app1Home, label: t("app1Landing"), path: app1Home, external: true },
    { href: app1Dashboard, label: t("app1Dashboard"), path: app1Dashboard, external: true },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <LocaleSwitch locale={locale} label={t("languageNav")} />
      </header>

      <ScreenGroup title={t("hubHeading")}>
        {hubLinks.map((item) => (
          <li key={item.href}>
            {item.href === "/terms" ? (
              <p className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground">{t("legalHeading")}</p>
            ) : null}
            <ScreenAnchor item={item} />
          </li>
        ))}
      </ScreenGroup>

      <ScreenGroup title={t("app1Heading")}>
        {appLinks.map((item) => (
          <li key={item.href}>
            <ScreenAnchor item={item} />
          </li>
        ))}
      </ScreenGroup>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">{t("accountsHeading")}</h2>
        <p className="mt-3 font-mono text-sm text-foreground">{t("adminRole")}: demo@example.com / password</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.rich("mockPurchase", {
            login: (chunks) => (
              <Link
                href="/login"
                className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </main>
  );
}

function ScreenGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="mt-2 divide-y divide-border/30 border-y border-border/30">{children}</ul>
    </section>
  );
}

function LocaleSwitch({ locale, label }: { locale: AppLocale; label: string }) {
  const locales = routing.locales;
  return (
    <nav aria-label={label} className="inline-flex items-center gap-1.5 text-sm">
      {locales.map((value, index) => {
        const active = value === locale;
        return (
          <span key={value} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="text-muted-foreground/60">
                |
              </span>
            ) : null}
            <Link
              href="/dev"
              locale={value}
              hrefLang={value}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "inline-flex min-h-11 items-center px-2 font-semibold text-foreground"
                  : "inline-flex min-h-11 items-center px-2 text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              }
            >
              {value === "en" ? "EN" : "JA"}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
