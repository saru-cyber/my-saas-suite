import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { systemSettings } from "../db/schema";
import { isHexColor, isThemeMode, type AppearanceSettings, type ThemeMode } from "./appearance";

export type BillingMode = "mock" | "test" | "live";

export interface AuthSettings {
  googleClientId: string;
  googleClientSecret: string;
  sessionTtlHours: number;
}

export interface BillingSettings {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: BillingMode;
  monthlyPriceId: string;
  yearlyPriceId: string;
  pricingTableId: string;
}

export interface AuthSettingsView {
  googleClientId: string;
  clientSecretMask: string;
  clientSecretConfigured: boolean;
  sessionTtlHours: number;
}

export interface BillingSettingsView {
  publishableKey: string;
  secretKeyMask: string;
  secretKeyConfigured: boolean;
  webhookSecretMask: string;
  webhookSecretConfigured: boolean;
  mode: BillingMode;
  monthlyPriceId: string;
  yearlyPriceId: string;
  pricingTableId: string;
  runtimeStaysMock: boolean;
}

export interface SettingsSnapshot {
  auth: AuthSettings;
  billing: BillingSettings;
  appearance: AppearanceSettings;
}

const DUMMY_STRIPE_SECRET_KEY = "sk_test_YOUR_STRIPE_SECRET_KEY";
const SETTING_KEYS = ["auth", "billing", "appearance"] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

let databaseDisabled = false;
let databaseClient: ReturnType<typeof postgres> | null = null;
let databaseReady: Promise<ReturnType<typeof postgres> | null> | null = null;
let snapshot: SettingsSnapshot | null = null;

function isBillingMode(value: unknown): value is BillingMode {
  return value === "mock" || value === "test" || value === "live";
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength || trimmed.includes("\0")) {
    return null;
  }
  return trimmed;
}

function defaultMode(): BillingMode {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (secretKey.length === 0 || secretKey === DUMMY_STRIPE_SECRET_KEY) {
    return "mock";
  }
  return secretKey.startsWith("sk_live") ? "live" : "test";
}

function envAuth(): AuthSettings {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    sessionTtlHours: 168,
  };
}

function envBilling(): BillingSettings {
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    mode: defaultMode(),
    monthlyPriceId: "",
    yearlyPriceId: "",
    pricingTableId: "",
  };
}

function envAppearance(): AppearanceSettings {
  return {
    primaryColor: "",
    logoUrl: "",
    defaultTheme: "system",
  };
}

function envSnapshot(): SettingsSnapshot {
  return {
    auth: envAuth(),
    billing: envBilling(),
    appearance: envAppearance(),
  };
}

export function maskSecret(secret: string): string {
  if (secret.length === 0) {
    return "";
  }
  return `••••${secret.slice(-4)}`;
}

function isDummySecret(secret: string): boolean {
  return secret.length === 0 || secret === DUMMY_STRIPE_SECRET_KEY;
}

export function toAuthView(settings: AuthSettings): AuthSettingsView {
  return {
    googleClientId: settings.googleClientId,
    clientSecretMask: maskSecret(settings.googleClientSecret),
    clientSecretConfigured: settings.googleClientSecret.length > 0,
    sessionTtlHours: settings.sessionTtlHours,
  };
}

export function toBillingView(settings: BillingSettings): BillingSettingsView {
  const envSecret = process.env.STRIPE_SECRET_KEY ?? "";
  return {
    publishableKey: settings.publishableKey,
    secretKeyMask: maskSecret(settings.secretKey),
    secretKeyConfigured: settings.secretKey.length > 0,
    webhookSecretMask: maskSecret(settings.webhookSecret),
    webhookSecretConfigured: settings.webhookSecret.length > 0,
    mode: settings.mode,
    monthlyPriceId: settings.monthlyPriceId,
    yearlyPriceId: settings.yearlyPriceId,
    pricingTableId: settings.pricingTableId,
    runtimeStaysMock: settings.mode !== "mock" && isDummySecret(settings.secretKey) && isDummySecret(envSecret),
  };
}

function parseAuth(value: unknown): AuthSettings | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const googleClientId = readText(record.googleClientId, 200);
  const googleClientSecret = readText(record.googleClientSecret, 500);
  const sessionTtlHours = record.sessionTtlHours;
  if (
    googleClientId === null ||
    googleClientSecret === null ||
    typeof sessionTtlHours !== "number" ||
    !Number.isInteger(sessionTtlHours) ||
    sessionTtlHours < 1 ||
    sessionTtlHours > 720
  ) {
    return null;
  }
  return { googleClientId, googleClientSecret, sessionTtlHours };
}

function parseBilling(value: unknown): BillingSettings | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const publishableKey = readText(record.publishableKey, 500);
  const secretKey = readText(record.secretKey, 500);
  const webhookSecret = readText(record.webhookSecret, 500);
  const monthlyPriceId = readText(record.monthlyPriceId, 200);
  const yearlyPriceId = readText(record.yearlyPriceId, 200);
  const pricingTableId = readText(record.pricingTableId, 200);
  if (
    publishableKey === null ||
    secretKey === null ||
    webhookSecret === null ||
    monthlyPriceId === null ||
    yearlyPriceId === null ||
    pricingTableId === null ||
    !isBillingMode(record.mode)
  ) {
    return null;
  }
  return {
    publishableKey,
    secretKey,
    webhookSecret,
    mode: record.mode,
    monthlyPriceId,
    yearlyPriceId,
    pricingTableId,
  };
}

function parseAppearance(value: unknown): AppearanceSettings | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const primaryColor = readText(record.primaryColor, 7);
  const logoUrl = readText(record.logoUrl, 500);
  if (primaryColor === null || logoUrl === null || !isThemeMode(record.defaultTheme)) {
    return null;
  }
  if (primaryColor.length > 0 && !isHexColor(primaryColor)) {
    return null;
  }
  return {
    primaryColor,
    logoUrl,
    defaultTheme: record.defaultTheme,
  };
}

function parseSnapshot(rows: ReadonlyArray<{ key: string; value: Record<string, unknown> }>): SettingsSnapshot {
  const fallback = envSnapshot();
  const next = { ...fallback };
  for (const row of rows) {
    if (row.key === "auth") {
      next.auth = parseAuth(row.value) ?? fallback.auth;
    }
    if (row.key === "billing") {
      next.billing = parseBilling(row.value) ?? fallback.billing;
    }
    if (row.key === "appearance") {
      next.appearance = parseAppearance(row.value) ?? fallback.appearance;
    }
  }
  const storedKeys = new Set(rows.map((row) => row.key));
  if (!storedKeys.has("auth")) {
    next.auth = fallback.auth;
  }
  if (!storedKeys.has("billing")) {
    next.billing = fallback.billing;
  }
  if (!storedKeys.has("appearance")) {
    next.appearance = fallback.appearance;
  }
  return next;
}

async function getDatabase(): Promise<ReturnType<typeof postgres> | null> {
  if (databaseDisabled) {
    return null;
  }
  if (!databaseReady) {
    databaseReady = (async () => {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        databaseDisabled = true;
        return null;
      }
      const client = postgres(databaseUrl, { connect_timeout: 1, max: 1, idle_timeout: 5 });
      try {
        await client`
          CREATE TABLE IF NOT EXISTS system_settings (
            key text PRIMARY KEY,
            value jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          )
        `;
        databaseClient = client;
        return client;
      } catch {
        databaseDisabled = true;
        await client.end({ timeout: 1 }).catch(() => undefined);
        return null;
      }
    })();
  }
  return databaseReady;
}

async function readRows(): Promise<Array<{ key: string; value: Record<string, unknown> }> | null> {
  const client = await getDatabase();
  if (!client) {
    return null;
  }
  try {
    const db = drizzle(client);
    const rows = await db.select().from(systemSettings);
    return rows.map((row) => ({ key: row.key, value: row.value }));
  } catch {
    databaseDisabled = true;
    if (databaseClient) {
      await databaseClient.end({ timeout: 1 }).catch(() => undefined);
      databaseClient = null;
    }
    return null;
  }
}

async function writeRow(key: SettingKey, value: Record<string, unknown>): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    await db
      .insert(systemSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() },
      });
  } catch {
    databaseDisabled = true;
  }
}

export async function readSettings(): Promise<SettingsSnapshot> {
  if (snapshot) {
    return snapshot;
  }
  const rows = await readRows();
  snapshot = rows ? parseSnapshot(rows) : envSnapshot();
  return snapshot;
}

export async function readAuthSettings(): Promise<AuthSettings> {
  return (await readSettings()).auth;
}

export async function readBillingSettings(): Promise<BillingSettings> {
  return (await readSettings()).billing;
}

export async function readAppearanceSettings(): Promise<AppearanceSettings> {
  return (await readSettings()).appearance;
}

function remember(next: SettingsSnapshot): void {
  snapshot = next;
}

export async function saveAuthSettingsRecord(nextAuth: AuthSettings): Promise<AuthSettings> {
  const current = await readSettings();
  const next = { ...current, auth: nextAuth };
  remember(next);
  await writeRow("auth", { ...nextAuth });
  return nextAuth;
}

export async function saveBillingSettingsRecord(nextBilling: BillingSettings): Promise<BillingSettings> {
  const current = await readSettings();
  const next = { ...current, billing: nextBilling };
  remember(next);
  await writeRow("billing", { ...nextBilling });
  return nextBilling;
}

export async function saveAppearanceSettingsRecord(nextAppearance: AppearanceSettings): Promise<AppearanceSettings> {
  const current = await readSettings();
  const next = { ...current, appearance: nextAppearance };
  remember(next);
  await writeRow("appearance", { ...nextAppearance });
  return nextAppearance;
}

export function sessionTtlSeconds(settings: AuthSettings): number {
  return settings.sessionTtlHours * 60 * 60;
}

export function isHttpLogoUrl(value: string): boolean {
  if (value.length === 0) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

