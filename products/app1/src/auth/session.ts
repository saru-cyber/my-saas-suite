import { isSuiteSessionClaims, type SuiteSessionClaims } from "./claims";

export const SESSION_COOKIE_NAME = "suite_session";
export const PRODUCT_ID = "app1";

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const binary = atob(normalized.padEnd(normalized.length + padding, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isUnexpired(value: unknown): boolean {
  if (typeof value !== "object" || value === null || !("exp" in value)) {
    return true;
  }
  return typeof value.exp === "number" && value.exp * 1000 > Date.now();
}

export async function verifySessionToken(token: string): Promise<SuiteSessionClaims | null> {
  const secret = process.env.HUB_JWT_SECRET;
  if (!secret) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const header: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    if (typeof header !== "object" || header === null || !("alg" in header) || header.alg !== "HS256") {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    if (!valid) {
      return null;
    }

    const payload: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    if (!isSuiteSessionClaims(payload) || !isUnexpired(payload)) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      activeProducts: payload.activeProducts,
      plan: payload.plan,
    };
  } catch {
    return null;
  }
}

export function hubUrl(): string {
  return process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000";
}

export function hasProductAccess(claims: SuiteSessionClaims): boolean {
  return claims.activeProducts.includes(PRODUCT_ID);
}
