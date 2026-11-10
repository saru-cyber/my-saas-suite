import { FooterLocaleSwitcher } from "./FooterLocaleSwitcher";
import { footerLabels, type FooterLocale } from "./labels";

export interface SuiteFooterProps {
  /** Hub origin. Defaults to NEXT_PUBLIC_HUB_URL, then http://localhost:3000. */
  hubUrl?: string;
  currentLocale: FooterLocale;
  /** Defaults to "my-saas-suite". */
  suiteName?: string;
}

function resolveHubUrl(hubUrl?: string): string {
  const url = hubUrl || process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/**
 * Shared footer for the Hub and every product (requirementsadd2.md §3.3).
 * Legal links always point at the Hub, which owns those pages.
 */
export function SuiteFooter({ hubUrl, currentLocale, suiteName = "my-saas-suite" }: SuiteFooterProps) {
  const labels = footerLabels[currentLocale];
  const base = `${resolveHubUrl(hubUrl)}/${currentLocale}`;
  const year = new Date().getFullYear();
  const legalLinks = [
    { href: `${base}/terms`, label: labels.terms },
    { href: `${base}/legal/merchant`, label: labels.merchant },
    { href: `${base}/privacy`, label: labels.privacy },
  ];

  return (
    <footer className="border-t border-border/40 bg-background text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © {year} {suiteName}. {labels.rights}
        </p>
        <nav aria-label={labels.legalNav}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <FooterLocaleSwitcher currentLocale={currentLocale} ariaLabel={labels.languageNav} />
      </div>
    </footer>
  );
}
