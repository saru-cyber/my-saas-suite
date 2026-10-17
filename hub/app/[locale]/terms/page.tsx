// Disclaimer text is rendered from messages and must stay visible at the top of this page.

import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { suiteSite } from "../../../src/site";

interface TermsBlock {
  heading: string;
  paragraphs: string[];
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const sections: TermsBlock[] = [
    { heading: t("scopeHeading"), paragraphs: [t("scopeBody", { suiteName: suiteSite.suiteName })] },
    { heading: t("accountHeading"), paragraphs: [t("accountBody")] },
    { heading: t("billingHeading"), paragraphs: [t("billingBody"), t("billingNote")] },
    { heading: t("refundHeading"), paragraphs: [t("refundBody")] },
    { heading: t("prohibitedHeading"), paragraphs: [t("prohibitedBody")] },
    { heading: t("liabilityHeading"), paragraphs: [t("liabilityBody"), t("liabilityNote")] },
    { heading: t("cancellationHeading"), paragraphs: [t("cancellationBody")] },
    { heading: t("lawHeading"), paragraphs: [t("lawBody")] },
  ];

  return (
    <main className="min-h-screen p-8">
      <article className="mx-auto max-w-2xl border border-gray-200 bg-white p-6">
        <p className="border border-gray-200 bg-gray-50 p-3 text-sm">{t("disclaimer")}</p>
        <h1 className="mt-6 text-xl">{t("title", { suiteName: suiteSite.suiteName })}</h1>
        <section className="mt-6 border border-gray-200 p-3 text-sm">
          <h2 className="text-base">{t("businessHeading")}</h2>
          <dl className="mt-2 flex flex-col gap-1">
            <div>{t("businessName")}</div>
            <div>{t("representative")}</div>
            <div>{t("address")}</div>
            <div>{t("contact")}</div>
            <div>{t("phone")}</div>
          </dl>
        </section>
        {sections.map((section) => (
          <section key={section.heading} className="mt-6 text-sm">
            <h2 className="text-base">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-2">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
