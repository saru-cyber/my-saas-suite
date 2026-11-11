import { parseCookie, stringifySetCookie } from "cookie";
import jwt from "jsonwebtoken";
import { normalizeSessionClaims, type SuiteSessionClaims } from "./claims";

export const SESSION_COOKIE_NAME = "suite_session";

const WEEK_SECONDS = 60 * 60 * 24 * 7;

function readJwtSecret(): string {
  const secret = process.env.HUB_JWT_SECRET;
  if (!secret) {
    throw new Error("HUB_JWT_SECRET が未設定です");
  }
  return secret;
}

export function signSession(claims: SuiteSessionClaims, expiresInSeconds = WEEK_SECONDS): string {
  return jwt.sign(claims, readJwtSecret(), {
    algorithm: "HS256",
    expiresIn: expiresInSeconds,
  });
}

export function verifySession(token: string): SuiteSessionClaims | null {
  try {
    const decoded: unknown = jwt.verify(token, readJwtSecret());
    return normalizeSessionClaims(decoded);
  } catch {
    return null;
  }
}

export function readSessionFromRequest(request: Request): SuiteSessionClaims | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const token = parseCookie(cookieHeader)[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }

  return verifySession(token);
}

export function buildSessionCookie(token: string, maxAge = WEEK_SECONDS): string {
  const domain = process.env.COOKIE_DOMAIN ?? "localhost";

  return stringifySetCookie({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    // Browsers drop Domain=localhost. Production uses COOKIE_DOMAIN like .your-suite.com.
    ...(domain === "localhost" ? {} : { domain }),
  });
}
