import { randomBytes } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import { sanitizeImage, sanitizeName } from "./profile";

export const GOOGLE_OAUTH_COOKIE = "google_oauth_state";

const STATE_MAX_AGE_SECONDS = 60 * 10;
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export interface GoogleProfile {
  email: string;
  name: string;
  image: string | null;
}

export function isGoogleConfigured(clientId: string, clientSecret: string): boolean {
  return clientId.trim().length > 0 && clientSecret.trim().length > 0;
}

/** Mock sign-in stays available in development, and whenever Google is not configured. */
export function isMockLoginEnabled(googleConfigured: boolean): boolean {
  return process.env.NODE_ENV !== "production" || !googleConfigured;
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (!forwardedHost) {
    return url.origin;
  }
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  return `${proto}://${forwardedHost}`;
}

export function googleRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function createOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export function buildGoogleStateCookie(state: string, locale: string): string {
  return stringifySetCookie({
    name: GOOGLE_OAUTH_COOKIE,
    value: `${state}.${locale}`,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  });
}

export function clearGoogleStateCookie(): string {
  return stringifySetCookie({
    name: GOOGLE_OAUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function readGoogleState(request: Request): { state: string; locale: "en" | "ja" } | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }
  const raw = parseCookie(cookieHeader)[GOOGLE_OAUTH_COOKIE];
  if (!raw) {
    return null;
  }
  const separator = raw.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }
  const state = raw.slice(0, separator);
  const locale = raw.slice(separator + 1);
  if ((locale !== "en" && locale !== "ja") || !/^[a-f0-9]{64}$/.test(state)) {
    return null;
  }
  return { state, locale };
}

export function googleAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function fetchGoogleProfile(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleProfile> {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.clientId,
    client_secret: input.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenResponse.ok) {
    throw new Error("Google token exchange failed");
  }
  const tokenBody: unknown = await tokenResponse.json();
  const accessToken =
    typeof tokenBody === "object" && tokenBody !== null && "access_token" in tokenBody
      ? tokenBody.access_token
      : null;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Google access token missing");
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileResponse.ok) {
    throw new Error("Google profile request failed");
  }
  const profile: unknown = await profileResponse.json();
  if (typeof profile !== "object" || profile === null) {
    throw new Error("Google profile missing");
  }
  const record = profile as Record<string, unknown>;
  if (record.email_verified === false || typeof record.email !== "string") {
    throw new Error("Google email missing");
  }
  const email = record.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Google email invalid");
  }
  return {
    email,
    name: sanitizeName(record.name),
    image: sanitizeImage(record.picture),
  };
}
