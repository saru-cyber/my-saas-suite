import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "../../i18n/navigation";
import { routing } from "../../i18n/routing";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <main>
      <section className="border-b border-gray-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl">{t("title")}</h1>
          <p className="mt-3 text-sm">{t("lead")}</p>
          <Link className="mt-6 inline-block border border-gray-200 px-3 py-2 text-sm" href="/dashboard">
            {t("cta")}
          </Link>
        </div>
      </section>
      <section className="border-b border-gray-200 px-6 py-8">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          <article className="border border-gray-200 bg-white p-3">
            <h2 className="text-base">{t("featureLoginTitle")}</h2>
            <p className="mt-2 text-sm">{t("featureLoginBody")}</p>
          </article>
          <article className="border border-gray-200 bg-white p-3">
            <h2 className="text-base">{t("featurePlanTitle")}</h2>
            <p className="mt-2 text-sm">{t("featurePlanBody")}</p>
          </article>
          <article className="border border-gray-200 bg-white p-3">
            <h2 className="text-base">{t("featureSetupTitle")}</h2>
            <p className="mt-2 text-sm">{t("featureSetupBody")}</p>
          </article>
        </div>
      </section>
      <section className="border-b border-gray-200 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-base">{t("pricingTitle")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <article className="border border-gray-200 bg-white p-3 text-sm">
              <h3>{t("planFreeName")}</h3>
              <p className="mt-2">{t("planFreePrice")}</p>
              <p className="mt-2">{t("planFreeDetails")}</p>
            </article>
            <article className="border border-gray-200 bg-white p-3 text-sm">
              <h3>{t("planProName")}</h3>
              <p className="mt-2">{t("planProPrice")}</p>
              <p className="mt-2">{t("planProDetails")}</p>
            </article>
          </div>
          <Link className="mt-4 inline-block border border-gray-200 bg-white px-3 py-2 text-sm" href="/dashboard">
            {t("pricingCta")}
          </Link>
        </div>
      </section>
      <section className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-base">{t("faqTitle")}</h2>
          <div className="mt-3 flex flex-col gap-3">
            <article className="border border-gray-200 bg-white p-3 text-sm">
              <h3>{t("faqLoginQuestion")}</h3>
              <p className="mt-2">{t("faqLoginAnswer")}</p>
            </article>
            <article className="border border-gray-200 bg-white p-3 text-sm">
              <h3>{t("faqPriceQuestion")}</h3>
              <p className="mt-2">{t("faqPriceAnswer")}</p>
            </article>
            <article className="border border-gray-200 bg-white p-3 text-sm">
              <h3>{t("faqCancelQuestion")}</h3>
              <p className="mt-2">{t("faqCancelAnswer")}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
