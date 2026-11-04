import { randomUUID } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";

export const VISITOR_COOKIE_NAME = "suite_vid";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

function isVisitorId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function readVisitorId(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }
  const value = parseCookie(cookieHeader)[VISITOR_COOKIE_NAME];
  if (!value || !isVisitorId(value)) {
    return null;
  }
  return value;
}

export function readOrCreateVisitorId(request: Request): { visitorId: string; created: boolean } {
  const existing = readVisitorId(request);
  if (existing) {
    return { visitorId: existing, created: false };
  }
  return { visitorId: randomUUID(), created: true };
}

export function buildVisitorCookie(visitorId: string): string {
  const domain = process.env.COOKIE_DOMAIN ?? "localhost";
  return stringifySetCookie({
    name: VISITOR_COOKIE_NAME,
    value: visitorId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: YEAR_SECONDS,
    ...(domain === "localhost" ? {} : { domain }),
  });
}
