import { isAdminEmail } from "./admin";
import { sanitizeImage, sanitizeName } from "./profile";

export type SuiteRole = "admin" | "member";

export interface SuiteSessionClaims {
  userId: string;
  email: string;
  name: string;
  image: string | null;
  activeProducts: string[];
  plan: string;
  role: SuiteRole;
  isAdmin: boolean;
}

export interface SessionProfile {
  userId: string;
  email: string;
  name: string;
  image: string | null;
  activeProducts: string[];
  plan: string;
}

/** Role follows ADMIN_EMAILS at issue time and again whenever the cookie is read. */
export function toSessionClaims(profile: SessionProfile): SuiteSessionClaims {
  const isAdmin = isAdminEmail(profile.email);
  return {
    userId: profile.userId,
    email: profile.email,
    name: sanitizeName(profile.name),
    image: sanitizeImage(profile.image),
    activeProducts: profile.activeProducts,
    plan: profile.plan,
    role: isAdmin ? "admin" : "member",
    isAdmin,
  };
}

export function isSuiteSessionClaims(value: unknown): value is SuiteSessionClaims {
  return normalizeSessionClaims(value) !== null;
}

export function normalizeSessionClaims(value: unknown): SuiteSessionClaims | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.userId !== "string" || typeof record.email !== "string" || typeof record.plan !== "string") {
    return null;
  }
  if (!Array.isArray(record.activeProducts) || !record.activeProducts.every((product) => typeof product === "string")) {
    return null;
  }

  return toSessionClaims({
    userId: record.userId,
    email: record.email,
    name: sanitizeName(record.name),
    image: sanitizeImage(record.image),
    activeProducts: record.activeProducts,
    plan: record.plan,
  });
}

export function roleFromClaims(value: unknown): SuiteRole {
  return value === "admin" ? "admin" : "member";
}
