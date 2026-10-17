import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { hasProductAccess, hubUrl, SESSION_COOKIE_NAME, verifySessionToken } from "../../../src/auth/session";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token) : null;
  if (!claims || !hasProductAccess(claims)) {
    redirect(`${hubUrl()}/${locale}`);
  }

  return (
    <main className="p-8">
      <section className="mx-auto max-w-md border border-gray-200 bg-white p-6">
        <h1 className="text-xl">{t("title")}</h1>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="border border-gray-200 p-2">
            {t("userId")}: {claims.userId}
          </div>
          <div className="border border-gray-200 p-2">
            {t("email")}: {claims.email}
          </div>
          <div className="border border-gray-200 p-2">
            {t("plan")}: {claims.plan}
          </div>
          <div className="border border-gray-200 p-2">
            {t("products")}: {claims.activeProducts.join(", ")}
          </div>
        </dl>
        <a
          className="mt-4 inline-block border border-gray-200 px-3 py-2 text-sm"
          href={`${hubUrl()}/${locale}`}
        >
          {t("back")}
        </a>
      </section>
    </main>
  );
}
