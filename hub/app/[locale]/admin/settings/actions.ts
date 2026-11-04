"use server";

import { cookies } from "next/headers";
import { roleFromClaims } from "../../../../src/auth/claims";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../src/auth/session";
import { isHexColor, isThemeMode, type AppearanceSettings } from "../../../../src/settings/appearance";
import {
  isHttpLogoUrl,
  readSettings,
  saveAppearanceSettingsRecord,
  saveAuthSettingsRecord,
  saveBillingSettingsRecord,
  toAuthView,
  toBillingView,
  type AuthSettingsView,
  type BillingMode,
  type BillingSettingsView,
} from "../../../../src/settings/store";

export type SettingsErrorCode = "forbidden" | "invalid" | "invalidTtl" | "invalidColor" | "invalidUrl";

export type SettingsActionResult<T> =
  | { ok: true; settings: T }
  | { ok: false; code: SettingsErrorCode };

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  return session !== null && roleFromClaims(session.role) === "admin";
}

function readBoundedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength || trimmed.includes("\0")) {
    return null;
  }
  return trimmed;
}

function isBillingMode(value: unknown): value is BillingMode {
  return value === "mock" || value === "test" || value === "live";
}

export async function saveAuthSettings(input: {
  googleClientId: string;
  googleClientSecret: string;
  sessionTtlHours: number;
}): Promise<SettingsActionResult<AuthSettingsView>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }

  const googleClientId = readBoundedText(input.googleClientId, 200);
  const googleClientSecret = readBoundedText(input.googleClientSecret, 500);
  if (
    googleClientId === null ||
    googleClientSecret === null ||
    typeof input.sessionTtlHours !== "number" ||
    !Number.isInteger(input.sessionTtlHours) ||
    input.sessionTtlHours < 1 ||
    input.sessionTtlHours > 720
  ) {
    return { ok: false, code: input.sessionTtlHours < 1 || input.sessionTtlHours > 720 ? "invalidTtl" : "invalid" };
  }

  const current = await readSettings();
  const saved = await saveAuthSettingsRecord({
    googleClientId,
    googleClientSecret: googleClientSecret.length > 0 ? googleClientSecret : current.auth.googleClientSecret,
    sessionTtlHours: input.sessionTtlHours,
  });
  return { ok: true, settings: toAuthView(saved) };
}

export async function saveBillingSettings(input: {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  pricingTableId: string;
}): Promise<SettingsActionResult<BillingSettingsView>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }

  const publishableKey = readBoundedText(input.publishableKey, 500);
  const secretKey = readBoundedText(input.secretKey, 500);
  const webhookSecret = readBoundedText(input.webhookSecret, 500);
  const monthlyPriceId = readBoundedText(input.monthlyPriceId, 200);
  const yearlyPriceId = readBoundedText(input.yearlyPriceId, 200);
  const pricingTableId = readBoundedText(input.pricingTableId, 200);
  if (
    publishableKey === null ||
    secretKey === null ||
    webhookSecret === null ||
    monthlyPriceId === null ||
    yearlyPriceId === null ||
    pricingTableId === null ||
    !isBillingMode(input.mode)
  ) {
    return { ok: false, code: "invalid" };
  }

  const current = await readSettings();
  const saved = await saveBillingSettingsRecord({
    publishableKey,
    secretKey: secretKey.length > 0 ? secretKey : current.billing.secretKey,
    webhookSecret: webhookSecret.length > 0 ? webhookSecret : current.billing.webhookSecret,
    mode: input.mode,
    monthlyPriceId,
    yearlyPriceId,
    pricingTableId,
  });
  return { ok: true, settings: toBillingView(saved) };
}

export async function saveAppearanceSettings(input: {
  primaryColor: string;
  logoUrl: string;
  defaultTheme: string;
}): Promise<SettingsActionResult<AppearanceSettings>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }

  const primaryColor = readBoundedText(input.primaryColor, 7);
  const logoUrl = readBoundedText(input.logoUrl, 500);
  if (primaryColor === null || logoUrl === null || !isThemeMode(input.defaultTheme)) {
    return { ok: false, code: "invalid" };
  }
  if (primaryColor.length > 0 && !isHexColor(primaryColor)) {
    return { ok: false, code: "invalidColor" };
  }
  if (!isHttpLogoUrl(logoUrl)) {
    return { ok: false, code: "invalidUrl" };
  }

  const saved = await saveAppearanceSettingsRecord({
    primaryColor,
    logoUrl,
    defaultTheme: input.defaultTheme,
  });
  return { ok: true, settings: saved };
}
