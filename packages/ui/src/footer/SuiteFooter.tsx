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
  const legalHref = `${resolveHubUrl(hubUrl)}/${currentLocale}/legal`;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 text-sm md:px-8">
        <p>
          © {year} {suiteName}. {labels.rights}
        </p>
        <a
          href={legalHref}
          className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {labels.legal}
        </a>
        <FooterLocaleSwitcher currentLocale={currentLocale} ariaLabel={labels.languageNav} />
      </div>
    </footer>
  );
}
