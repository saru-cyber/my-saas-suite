import { headers } from "next/headers";
import { FooterLocaleSwitcher } from "./FooterLocaleSwitcher";
import { footerLabels, type FooterLocale } from "./labels";
import { SuiteSwitcher, type SuiteSwitcherLink } from "./SuiteSwitcher";
import { app1Origin, hubOrigin } from "./urls";

export interface SuiteFooterProps {
  /** Hub origin. Defaults to NEXT_PUBLIC_HUB_URL, then http://localhost:3000. */
  hubUrl?: string;
  /** App 1 origin. Defaults to NEXT_PUBLIC_APP1_URL, then http://localhost:3001. */
  app1Url?: string;
  currentLocale: FooterLocale;
  /** Defaults to "my-saas-suite". */
  suiteName?: string;
  /** Trigger label for the suite menu. Defaults to "Suite". */
  menuLabel?: string;
  /**
   * Menu item to mark as the app on screen. When omitted, the footer matches
   * the current URL against the menu links.
   */
  activeHref?: string;
  /**
   * Product entries shown between the suite account and the dev portal.
   * Defaults to App 1. Pass a list to add or replace product apps.
   */
  products?: SuiteSwitcherLink[];
}

function FooterDivider() {
  return (
    <span aria-hidden="true" className="select-none text-zinc-600">
      |
    </span>
  );
}

function devPortalHref(hub: string, locale: FooterLocale): string | null {
  if (process.env.NODE_ENV === "production" || process.env.DEV_PORTAL_ENABLED === "false") {
    return null;
  }
  return `${hub}/${locale}/dev`;
}

const legalLinks = [
  { slug: "terms", label: "terms" },
  { slug: "privacy", label: "privacy" },
  { slug: "tokushoho", label: "tokushoho" },
  { slug: "specified-electronic-mail", label: "email" },
] as const;

/**
 * Shared footer for the Hub and every product.
 * Legal links open the four documents rendered by the current app.
 */
export async function SuiteFooter({
  hubUrl,
  app1Url,
  currentLocale,
  suiteName = "my-saas-suite",
  menuLabel,
  products,
  activeHref,
}: SuiteFooterProps) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host")?.split(",")[0]?.trim() || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  const currentOrigin = host ? `${proto}://${host}` : null;
  const labels = footerLabels[currentLocale];
  const hub = hubOrigin(hubUrl);
  const productLinks = products ?? [{ href: app1Origin(app1Url), label: labels.app1 }];
  const links: SuiteSwitcherLink[] = [
    { href: `${hub}/${currentLocale}/dashboard`, label: labels.suiteAccount },
    ...productLinks,
  ];
  const devHref = devPortalHref(hub, currentLocale);
  if (devHref) {
    links.push({ href: devHref, label: labels.devPortal });
  }
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-auto border-t border-border/40 bg-background text-muted-foreground print:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-y-1 px-6 py-2 text-sm sm:grid-cols-[1fr_auto_1fr] md:px-8">
        <p className="sm:justify-self-start">
          © {year} {suiteName}. {labels.rights}
        </p>
        <div className="flex items-center gap-x-3 sm:justify-self-center">
          <FooterDivider />
          <SuiteSwitcher
            menuLabel={menuLabel ?? labels.suiteMenu}
            links={links}
            currentOrigin={currentOrigin}
            activeHref={activeHref}
          />
          <FooterDivider />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 sm:justify-self-end">
          <FooterLocaleSwitcher currentLocale={currentLocale} ariaLabel={labels.languageNav} />
        </div>
      </div>
      <nav aria-label={labels.legalNav} className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-6 pb-2 text-sm md:px-8">
        {legalLinks.map((item, index) => (
          <span key={item.slug} className="inline-flex items-center gap-x-3">
            {index > 0 ? <FooterDivider /> : null}
            <a
              href={`/${currentLocale}/legal/${item.slug}`}
              className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              {labels[item.label]}
            </a>
          </span>
        ))}
      </nav>
    </footer>
  );
}
