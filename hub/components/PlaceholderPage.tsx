import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../i18n/routing";

/** Validates the locale param and enables static rendering for a placeholder page. */
export function preparePlaceholderLocale(locale: string): void {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
}

/** Minimal "coming soon" page for legal pages linked from SuiteFooter but not written yet. */
export function PlaceholderPage({ title, body }: { title: string; body: string }) {
  return (
    <main className="p-8">
      <article className="mx-auto max-w-2xl rounded-lg border border-border/40 bg-card p-6">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 rounded-md border border-border/40 bg-muted/40 p-3 text-sm text-muted-foreground">{body}</p>
      </article>
    </main>
  );
}
