import { NextResponse } from "next/server";
import { isAppLocale } from "../../../../i18n/routing";
import { readSessionFromRequest } from "../../../../src/auth/session";
import { createCustomerPortalUrl } from "../../../../src/billing/portal";
import { isStripeMockMode } from "../../../../src/billing/stripe";

export const runtime = "nodejs";

function dashboardUrl(origin: string, locale: string, notice?: string): URL {
  const url = new URL(`/${locale}/dashboard`, origin);
  if (notice) {
    url.searchParams.set("notice", notice);
  }
  return url;
}

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const localeParam = requestUrl.searchParams.get("locale") ?? "en";
  const locale = isAppLocale(localeParam) ? localeParam : "en";
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}`, requestUrl.origin));
  }

  if (isStripeMockMode()) {
    return NextResponse.redirect(dashboardUrl(requestUrl.origin, locale, "portal-mock"));
  }

  try {
    const portalUrl = await createCustomerPortalUrl(
      session.email,
      dashboardUrl(requestUrl.origin, locale).toString(),
    );
    if (!portalUrl) {
      return NextResponse.redirect(dashboardUrl(requestUrl.origin, locale, "portal-unavailable"));
    }
    return NextResponse.redirect(portalUrl);
  } catch {
    return NextResponse.redirect(dashboardUrl(requestUrl.origin, locale, "portal-unavailable"));
  }
}
