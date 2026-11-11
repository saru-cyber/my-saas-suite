// Disclaimer text is rendered from the legal copy and must stay visible at the top of this page.

import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "../../../i18n/navigation";
import { routing, type AppLocale } from "../../../i18n/routing";
import { isLegalTab, LEGAL_TABS, legalCopy, type LegalCopy, type LegalTab } from "../../../src/legal/documents";
import { LegalFields, LegalSections } from "./document";

function readTab(value: string | string[] | undefined): LegalTab {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab && isLegalTab(tab)) {
    return tab;
  }
  return "terms";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const copy = legalCopy[locale];
  const tab = readTab((await searchParams).tab);
  return { title: `${copy.tabs[tab]} · ${copy.title}` };
}

export default async function LegalPage({
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
  const tab = readTab((await searchParams).tab);
  const copy = legalCopy[locale];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      <p className="mt-4 rounded-md bg-muted/40 px-3 py-3 text-sm text-foreground">{copy.disclaimer}</p>
      <LegalTabs locale={locale} copy={copy} active={tab} />
      <article id="legal-panel" className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{copy.tabs[tab]}</h2>
        {tab === "terms" ? <TermsPanel copy={copy} /> : null}
        {tab === "privacy" ? <StatementPanel intro={copy.privacy.intro} fields={copy.privacy.fields} sections={copy.privacy.sections} /> : null}
        {tab === "merchant" ? <StatementPanel intro={copy.merchant.intro} fields={copy.merchant.fields} sections={copy.merchant.sections} /> : null}
        {tab === "email" ? <StatementPanel intro={copy.email.intro} fields={copy.email.fields} sections={copy.email.sections} /> : null}
      </article>
    </main>
  );
}

function LegalTabs({ locale, copy, active }: { locale: AppLocale; copy: LegalCopy; active: LegalTab }) {
  return (
    <nav aria-label={copy.tabListLabel} className="mt-8 overflow-x-auto">
      <ul className="flex w-max min-w-full gap-1 border-b border-border/40">
        {LEGAL_TABS.map((tab) => {
          const selected = tab === active;
          return (
            <li key={tab}>
              <Link
                href={`/legal?tab=${tab}`}
                hrefLang={locale}
                aria-current={selected ? "page" : undefined}
                className={
                  selected
                    ? "inline-flex min-h-11 items-center border-b-2 border-foreground px-3 text-sm font-medium whitespace-nowrap text-foreground"
                    : "inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                }
              >
                {copy.tabs[tab]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TermsPanel({ copy }: { copy: LegalCopy }) {
  const terms = copy.terms;
  return (
    <div>
      <h3 className="mt-8 text-lg font-semibold text-foreground">{terms.commonHeading}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{terms.commonLead}</p>
      <h4 className="mt-8 text-base font-medium text-foreground">{terms.operatorHeading}</h4>
      <LegalFields rows={terms.operator} />
      <LegalSections sections={terms.common} headingLevel="h4" />
      <h3 className="mt-12 text-lg font-semibold text-foreground">{terms.productsHeading}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{terms.productsLead}</p>
      {terms.products.map((product) => (
        <section key={product.id} id={`product-${product.id}`} className="mt-8">
          <h4 className="text-base font-semibold text-foreground">{product.name}</h4>
          <LegalSections sections={product.sections} headingLevel="h5" />
        </section>
      ))}
    </div>
  );
}

function StatementPanel({
  intro,
  fields,
  sections,
}: {
  intro: string;
  fields: LegalCopy["privacy"]["fields"];
  sections: LegalCopy["privacy"]["sections"];
}) {
  return (
    <div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{intro}</p>
      <LegalFields rows={fields} />
      <LegalSections sections={sections} />
    </div>
  );
}
