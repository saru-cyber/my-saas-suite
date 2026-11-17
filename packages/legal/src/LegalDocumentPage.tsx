import { legalChrome, type LegalLocale, type LegalSlug } from "./documents";
import { loadLegalCatalog, loadLegalDocument } from "./load";
import { LegalMarkdown } from "./markdown";

const tabClass =
  "inline-flex min-h-11 items-center border-b-2 px-3 text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function legalDocumentTitle(locale: LegalLocale, slug: LegalSlug): string {
  return loadLegalDocument(locale, slug).title;
}

export function LegalDocumentPage({ locale, slug }: { locale: LegalLocale; slug: LegalSlug }) {
  const documents = loadLegalCatalog(locale);
  const current = documents.find((document) => document.slug === slug) ?? loadLegalDocument(locale, slug);
  const chrome = legalChrome[locale];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <p className="rounded-md bg-muted/40 px-3 py-3 text-sm text-foreground">{chrome.disclaimer}</p>
      <nav aria-label={chrome.navLabel} className="mt-8 overflow-x-auto">
        <ul className="flex w-max min-w-full gap-1 border-b border-border/40">
          {documents.map((document) => {
            const selected = document.slug === current.slug;
            return (
              <li key={document.slug}>
                <a
                  href={`/${locale}/legal/${document.slug}`}
                  aria-current={selected ? "page" : undefined}
                  className={
                    selected
                      ? `${tabClass} border-foreground font-medium text-foreground`
                      : `${tabClass} border-transparent text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none`
                  }
                >
                  {document.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <article id="legal-panel" className="mt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{current.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <span>
            {chrome.effectiveDate}: {current.effectiveDate}
          </span>
          <span aria-hidden="true" className="px-2 text-zinc-600">
            |
          </span>
          <span>
            {chrome.updatedAt}: {current.updatedAt}
          </span>
        </p>
        <LegalMarkdown source={current.body} />
      </article>
    </main>
  );
}
