import { NextResponse } from "next/server";
import {
  clearGoogleStateCookie,
  fetchGoogleProfile,
  googleRedirectUri,
  isGoogleConfigured,
  readGoogleState,
  requestOrigin,
} from "../../../../../src/auth/google";
import { buildSessionCookie, signSession } from "../../../../../src/auth/session";
import { sessionClaimsForUser, upsertOAuthUser } from "../../../../../src/db/users";
import { readAuthSettings, sessionTtlSeconds } from "../../../../../src/settings/store";

export const runtime = "nodejs";

function fail(origin: string, locale: string): NextResponse {
  const response = NextResponse.redirect(`${origin}/${locale}/login?error=google`);
  response.headers.append("Set-Cookie", clearGoogleStateCookie());
  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  const origin = requestOrigin(request);
  const saved = readGoogleState(request);
  const locale = saved?.locale ?? "ja";
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!saved || !code || state !== saved.state) {
    return fail(origin, locale);
  }

  try {
    const auth = await readAuthSettings();
    if (!isGoogleConfigured(auth.googleClientId, auth.googleClientSecret)) {
      return fail(origin, locale);
    }
    const profile = await fetchGoogleProfile({
      code,
      clientId: auth.googleClientId,
      clientSecret: auth.googleClientSecret,
      redirectUri: googleRedirectUri(origin),
    });
    const claims = sessionClaimsForUser(upsertOAuthUser(profile));
    const maxAge = sessionTtlSeconds(auth);
    const response = NextResponse.redirect(`${origin}/${locale}/dashboard`);
    response.headers.append("Set-Cookie", buildSessionCookie(signSession(claims, maxAge), maxAge));
    response.headers.append("Set-Cookie", clearGoogleStateCookie());
    return response;
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "Google callback failed");
    return fail(origin, locale);
  }
}
