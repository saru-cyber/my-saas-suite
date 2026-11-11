import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { displayNameFromEmail } from "../../../src/account/display-name";
import { SESSION_COOKIE_NAME, verifySession } from "../../../src/auth/session";
import { isStripeMockMode } from "../../../src/billing/stripe";
import { routing } from "../../../i18n/routing";
import { AccountOverview } from "./_components/AccountOverview";
import { ProductAccessGrid } from "./_components/ProductAccessGrid";
import { StatusMetrics } from "./_components/StatusMetrics";

export const dynamic = "force-dynamic";

const DASHBOARD_NOTICES = ["portal-mock", "portal-unavailable"] as const;

type DashboardNotice = (typeof DASHBOARD_NOTICES)[number];

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}

function readNotice(value: string | string[] | undefined): DashboardNotice | null {
  const notice = Array.isArray(value) ? value[0] : value;
  if (notice === "portal-mock" || notice === "portal-unavailable") {
    return notice;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  return { title: t("metaTitle") };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const query = await searchParams;
  const notice = readNotice(query.notice);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? verifySession(token) : null;
  if (!claims) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("dashboard");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-6 pb-16 md:px-8 md:pt-8">
      {notice ? (
        <p
          role="status"
          className="mb-8 rounded-lg border border-border/40 bg-muted/40 px-4 py-3 text-sm text-foreground"
        >
          {notice === "portal-mock" ? t("portalMock") : t("portalUnavailable")}
        </p>
      ) : null}
      <AccountOverview
        displayName={claims.name.length > 0 ? claims.name : displayNameFromEmail(claims.email)}
        email={claims.email}
        portalHref={`/api/stripe/portal?locale=${locale}`}
        portalExternal={!isStripeMockMode()}
        showAdminLink={claims.isAdmin}
      />
      <StatusMetrics plan={claims.plan} activeProducts={claims.activeProducts} />
      <ProductAccessGrid locale={locale} activeProducts={claims.activeProducts} />
    </main>
  );
}
