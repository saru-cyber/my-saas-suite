import { NextResponse } from "next/server";
import {
  buildGoogleStateCookie,
  createOAuthState,
  googleAuthorizeUrl,
  googleRedirectUri,
  isGoogleConfigured,
  requestOrigin,
} from "../../../../src/auth/google";
import { readAuthSettings } from "../../../../src/settings/store";

export const runtime = "nodejs";

function loginLocale(request: Request): "en" | "ja" {
  const locale = new URL(request.url).searchParams.get("locale");
  return locale === "en" || locale === "ja" ? locale : "ja";
}

export async function GET(request: Request): Promise<NextResponse> {
  const locale = loginLocale(request);
  const origin = requestOrigin(request);
  const auth = await readAuthSettings();
  if (!isGoogleConfigured(auth.googleClientId, auth.googleClientSecret)) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=google_unconfigured`);
  }

  const state = createOAuthState();
  const response = NextResponse.redirect(
    googleAuthorizeUrl({
      clientId: auth.googleClientId,
      redirectUri: googleRedirectUri(origin),
      state,
    }),
  );
  response.headers.append("Set-Cookie", buildGoogleStateCookie(state, locale));
  return response;
}
