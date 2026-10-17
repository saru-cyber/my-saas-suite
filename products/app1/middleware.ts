import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { isAppLocale, type AppLocale, routing } from "./i18n/routing";
import { hasProductAccess, hubUrl, SESSION_COOKIE_NAME, verifySessionToken } from "./src/auth/session";

const handleI18nRouting = createIntlMiddleware(routing);

function dashboardLocale(pathname: string): AppLocale | null {
  const [, locale, page] = pathname.split("/");
  if (!locale || !isAppLocale(locale) || page !== "dashboard") {
    return null;
  }
  return locale;
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = handleI18nRouting(request);
  const locale = dashboardLocale(request.nextUrl.pathname);
  if (!locale) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token) : null;
  if (!claims || !hasProductAccess(claims)) {
    return NextResponse.redirect(new URL(`/${locale}`, hubUrl()));
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|ja)/:path*", "/((?!api|_next|.*\\..*).*)"],
};
