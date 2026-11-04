import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { abTestEvents, abTests, pricingConfigurations, productBundles } from "../db/schema";

export type AbTestStatus = "draft" | "running" | "paused" | "finished";
export type AbVariant = "A" | "B";
export type AbEventType = "impression" | "checkout_start" | "conversion";

export interface PricingConfiguration {
  id: string;
  targetId: string;
  patternId: string;
  stripePriceId: string;
  currency: string;
  trialDays: number;
  isActive: boolean;
}

export interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  includedProductIds: string[];
  description: string;
}

export interface AbTest {
  id: string;
  name: string;
  targetId: string;
  status: AbTestStatus;
  trafficRatioA: number;
  variantAPatternId: string;
  variantAPriceId: string;
  variantBPatternId: string;
  variantBPriceId: string;
}

export interface AbTestEvent {
  id: string;
  testId: string;
  userId: string | null;
  visitorId: string | null;
  variant: AbVariant;
  eventType: AbEventType;
  amountCents: number | null;
  createdAt: Date;
}

export type SaveResult<T> = { ok: true; value: T } | { ok: false; message: string };

export interface PricingConfigurationInput {
  id?: string;
  targetId: string;
  patternId: string;
  stripePriceId: string;
  currency: string;
  trialDays: number;
  isActive: boolean;
}

export interface ProductBundleInput {
  id?: string;
  name: string;
  slug: string;
  includedProductIds: string[];
  description?: string;
}

export interface AbTestInput {
  id?: string;
  name: string;
  targetId: string;
  status: AbTestStatus;
  trafficRatioA?: number;
  variantAPatternId: string;
  variantAPriceId: string;
  variantBPatternId: string;
  variantBPriceId: string;
}

export interface AbTestEventInput {
  testId: string;
  userId?: string | null;
  visitorId?: string | null;
  variant: AbVariant;
  eventType: AbEventType;
  amountCents?: number | null;
}

const pricingById = new Map<string, PricingConfiguration>();
const bundlesById = new Map<string, ProductBundle>();
const testsById = new Map<string, AbTest>();
const events: AbTestEvent[] = [];

let databaseDisabled = false;
let databaseClient: ReturnType<typeof postgres> | null = null;
let databaseReady: Promise<ReturnType<typeof postgres> | null> | null = null;
let snapshotReady: Promise<void> | null = null;

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength || trimmed.includes("\0")) {
    return null;
  }
  return trimmed;
}

function isStatus(value: unknown): value is AbTestStatus {
  return value === "draft" || value === "running" || value === "paused" || value === "finished";
}

function isVariant(value: unknown): value is AbVariant {
  return value === "A" || value === "B";
}

function isEventType(value: unknown): value is AbEventType {
  return value === "impression" || value === "checkout_start" || value === "conversion";
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
          CREATE TABLE IF NOT EXISTS pricing_configurations (
            id uuid PRIMARY KEY,
            target_id text NOT NULL,
            pattern_id text NOT NULL,
            stripe_price_id text NOT NULL,
            currency text NOT NULL,
            trial_days integer NOT NULL DEFAULT 0,
            is_active boolean NOT NULL DEFAULT false,
            UNIQUE (target_id, pattern_id)
          )
        `;
        await client`
          CREATE TABLE IF NOT EXISTS product_bundles (
            id text PRIMARY KEY,
            name text NOT NULL,
            slug text NOT NULL UNIQUE,
            included_product_ids jsonb NOT NULL,
            description text NOT NULL DEFAULT ''
          )
        `;
        await client`
          CREATE TABLE IF NOT EXISTS ab_tests (
            id text PRIMARY KEY,
            name text NOT NULL,
            target_id text NOT NULL,
            status text NOT NULL DEFAULT 'draft',
            traffic_ratio_a integer NOT NULL DEFAULT 50,
            variant_a_pattern_id text NOT NULL,
            variant_a_price_id text NOT NULL,
            variant_b_pattern_id text NOT NULL,
            variant_b_price_id text NOT NULL
          )
        `;
        await client`
          CREATE TABLE IF NOT EXISTS ab_test_events (
            id uuid PRIMARY KEY,
            test_id text NOT NULL,
            user_id text,
            visitor_id text,
            variant text NOT NULL,
            event_type text NOT NULL,
            amount_cents integer,
            created_at timestamptz NOT NULL DEFAULT now()
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

async function loadFromDatabase(): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    const [prices, bundles, tests, storedEvents] = await Promise.all([
      db.select().from(pricingConfigurations),
      db.select().from(productBundles),
      db.select().from(abTests),
      db.select().from(abTestEvents),
    ]);
    pricingById.clear();
    for (const row of prices) {
      pricingById.set(row.id, {
        id: row.id,
        targetId: row.targetId,
        patternId: row.patternId,
        stripePriceId: row.stripePriceId,
        currency: row.currency,
        trialDays: row.trialDays,
        isActive: row.isActive,
      });
    }
    bundlesById.clear();
    for (const row of bundles) {
      bundlesById.set(row.id, {
        id: row.id,
        name: row.name,
        slug: row.slug,
        includedProductIds: row.includedProductIds,
        description: row.description,
      });
    }
    testsById.clear();
    for (const row of tests) {
      if (!isStatus(row.status)) {
        continue;
      }
      testsById.set(row.id, {
        id: row.id,
        name: row.name,
        targetId: row.targetId,
        status: row.status,
        trafficRatioA: row.trafficRatioA,
        variantAPatternId: row.variantAPatternId,
        variantAPriceId: row.variantAPriceId,
        variantBPatternId: row.variantBPatternId,
        variantBPriceId: row.variantBPriceId,
      });
    }
    events.length = 0;
    for (const row of storedEvents) {
      if (!isVariant(row.variant) || !isEventType(row.eventType)) {
        continue;
      }
      events.push({
        id: row.id,
        testId: row.testId,
        userId: row.userId,
        visitorId: row.visitorId,
        variant: row.variant,
        eventType: row.eventType,
        amountCents: row.amountCents,
        createdAt: row.createdAt,
      });
    }
  } catch {
    databaseDisabled = true;
    if (databaseClient) {
      await databaseClient.end({ timeout: 1 }).catch(() => undefined);
      databaseClient = null;
    }
  }
}

function ensureLoaded(): Promise<void> {
  if (!snapshotReady) {
    snapshotReady = loadFromDatabase();
  }
  return snapshotReady;
}

async function persistPricing(row: PricingConfiguration): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    await db
      .insert(pricingConfigurations)
      .values(row)
      .onConflictDoUpdate({
        target: pricingConfigurations.id,
        set: {
          targetId: row.targetId,
          patternId: row.patternId,
          stripePriceId: row.stripePriceId,
          currency: row.currency,
          trialDays: row.trialDays,
          isActive: row.isActive,
        },
      });
  } catch {
    databaseDisabled = true;
  }
}

async function persistBundle(row: ProductBundle): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    await db
      .insert(productBundles)
      .values(row)
      .onConflictDoUpdate({
        target: productBundles.id,
        set: {
          name: row.name,
          slug: row.slug,
          includedProductIds: row.includedProductIds,
          description: row.description,
        },
      });
  } catch {
    databaseDisabled = true;
  }
}

async function persistTest(row: AbTest): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    await db
      .insert(abTests)
      .values(row)
      .onConflictDoUpdate({
        target: abTests.id,
        set: {
          name: row.name,
          targetId: row.targetId,
          status: row.status,
          trafficRatioA: row.trafficRatioA,
          variantAPatternId: row.variantAPatternId,
          variantAPriceId: row.variantAPriceId,
          variantBPatternId: row.variantBPatternId,
          variantBPriceId: row.variantBPriceId,
        },
      });
  } catch {
    databaseDisabled = true;
  }
}

async function persistEvent(row: AbTestEvent): Promise<void> {
  const client = await getDatabase();
  if (!client) {
    return;
  }
  try {
    const db = drizzle(client);
    await db.insert(abTestEvents).values(row).onConflictDoNothing({ target: abTestEvents.id });
  } catch {
    databaseDisabled = true;
  }
}

export async function listPricingConfigurations(): Promise<PricingConfiguration[]> {
  await ensureLoaded();
  return [...pricingById.values()].sort((left, right) => left.targetId.localeCompare(right.targetId) || left.patternId.localeCompare(right.patternId));
}

export async function getActivePricing(targetId: string): Promise<PricingConfiguration | null> {
  const rows = (await listPricingConfigurations()).filter((row) => row.targetId === targetId && row.isActive);
  return rows.find((row) => row.patternId === "default") ?? rows[0] ?? null;
}

export async function findPricing(targetId: string, patternId: string): Promise<PricingConfiguration | null> {
  const rows = await listPricingConfigurations();
  return rows.find((row) => row.targetId === targetId && row.patternId === patternId) ?? null;
}

export async function savePricingConfiguration(input: PricingConfigurationInput): Promise<SaveResult<PricingConfiguration>> {
  await ensureLoaded();
  const targetId = readText(input.targetId, 80);
  const patternId = readText(input.patternId, 80);
  const stripePriceId = readText(input.stripePriceId, 120);
  const currency = readText(input.currency, 3)?.toLowerCase() ?? null;
  if (!targetId || !patternId || !stripePriceId || !currency || !/^[a-z]{3}$/.test(currency)) {
    return { ok: false, message: "価格設定の項目が不正です" };
  }
  if (!Number.isInteger(input.trialDays) || input.trialDays < 0 || input.trialDays > 730) {
    return { ok: false, message: "試用日数は 0 から 730 の整数です" };
  }

  const existing = [...pricingById.values()].find((row) => row.targetId === targetId && row.patternId === patternId);
  const id = existing?.id ?? (input.id && pricingById.has(input.id) ? input.id : randomUUID());
  const next: PricingConfiguration = {
    id,
    targetId,
    patternId,
    stripePriceId,
    currency,
    trialDays: input.trialDays,
    isActive: input.isActive,
  };
  pricingById.set(id, next);
  const deactivated: PricingConfiguration[] = [];
  if (next.isActive) {
    for (const row of pricingById.values()) {
      if (row.targetId === targetId && row.id !== id && row.isActive) {
        const inactive = { ...row, isActive: false };
        pricingById.set(row.id, inactive);
        deactivated.push(inactive);
      }
    }
  }
  await persistPricing(next);
  for (const row of deactivated) {
    await persistPricing(row);
  }
  return { ok: true, value: next };
}

export async function listProductBundles(): Promise<ProductBundle[]> {
  await ensureLoaded();
  return [...bundlesById.values()].sort((left, right) => left.slug.localeCompare(right.slug));
}

export async function getProductBundle(id: string): Promise<ProductBundle | null> {
  await ensureLoaded();
  return bundlesById.get(id) ?? null;
}

export async function saveProductBundle(input: ProductBundleInput): Promise<SaveResult<ProductBundle>> {
  await ensureLoaded();
  const name = readText(input.name, 120);
  const slug = readText(input.slug, 80);
  const description = input.description === undefined ? "" : input.description.trim();
  if (!name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, message: "バンドル名またはスラッグが不正です" };
  }
  if (description.length > 2000) {
    return { ok: false, message: "説明が長すぎます" };
  }
  if (!Array.isArray(input.includedProductIds) || input.includedProductIds.length === 0) {
    return { ok: false, message: "バンドルにはプロダクト ID が必要です" };
  }
  const includedProductIds: string[] = [];
  for (const productId of input.includedProductIds) {
    const parsed = readText(productId, 80);
    if (!parsed || includedProductIds.includes(parsed)) {
      return { ok: false, message: "プロダクト ID が不正です" };
    }
    includedProductIds.push(parsed);
  }
  const slugOwner = [...bundlesById.values()].find((row) => row.slug === slug);
  const id = input.id?.trim() || slugOwner?.id || randomUUID();
  if (slugOwner && slugOwner.id !== id) {
    return { ok: false, message: "このスラッグは使用中です" };
  }
  const next: ProductBundle = { id, name, slug, includedProductIds, description };
  bundlesById.set(id, next);
  await persistBundle(next);
  return { ok: true, value: next };
}

export async function listAbTests(): Promise<AbTest[]> {
  await ensureLoaded();
  return [...testsById.values()].sort((left, right) => left.targetId.localeCompare(right.targetId) || left.id.localeCompare(right.id));
}

export async function getRunningAbTest(targetId: string): Promise<AbTest | null> {
  const running = (await listAbTests()).filter((test) => test.targetId === targetId && test.status === "running");
  return running[0] ?? null;
}

export async function saveAbTest(input: AbTestInput): Promise<SaveResult<AbTest>> {
  await ensureLoaded();
  const name = readText(input.name, 120);
  const targetId = readText(input.targetId, 80);
  const variantAPatternId = readText(input.variantAPatternId, 80);
  const variantAPriceId = readText(input.variantAPriceId, 120);
  const variantBPatternId = readText(input.variantBPatternId, 80);
  const variantBPriceId = readText(input.variantBPriceId, 120);
  const trafficRatioA = input.trafficRatioA ?? 50;
  if (!name || !targetId || !variantAPatternId || !variantAPriceId || !variantBPatternId || !variantBPriceId) {
    return { ok: false, message: "A/Bテストの項目が不正です" };
  }
  if (!isStatus(input.status)) {
    return { ok: false, message: "A/Bテストの状態が不正です" };
  }
  if (!Number.isInteger(trafficRatioA) || trafficRatioA < 0 || trafficRatioA > 100) {
    return { ok: false, message: "配分は 0 から 100 の整数です" };
  }
  const id = input.id?.trim() || randomUUID();
  const next: AbTest = {
    id,
    name,
    targetId,
    status: input.status,
    trafficRatioA,
    variantAPatternId,
    variantAPriceId,
    variantBPatternId,
    variantBPriceId,
  };
  testsById.set(id, next);
  await persistTest(next);
  return { ok: true, value: next };
}

export async function listAbTestEvents(testId?: string): Promise<AbTestEvent[]> {
  await ensureLoaded();
  const rows = testId ? events.filter((event) => event.testId === testId) : events;
  return [...rows].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
}

export async function recordAbTestEvent(input: AbTestEventInput): Promise<SaveResult<AbTestEvent>> {
  await ensureLoaded();
  const testId = readText(input.testId, 80);
  const userId = input.userId == null || input.userId === "" ? null : readText(input.userId, 80);
  const visitorId = input.visitorId == null || input.visitorId === "" ? null : readText(input.visitorId, 80);
  if (!testId || !isVariant(input.variant) || !isEventType(input.eventType)) {
    return { ok: false, message: "計測イベントが不正です" };
  }
  if (!testsById.has(testId)) {
    return { ok: false, message: "A/Bテストが見つかりません" };
  }
  if (!userId && !visitorId) {
    return { ok: false, message: "ユーザーまたは訪問者 ID が必要です" };
  }
  if (input.userId && !userId) {
    return { ok: false, message: "ユーザー ID が不正です" };
  }
  if (input.visitorId && !visitorId) {
    return { ok: false, message: "訪問者 ID が不正です" };
  }
  const amountCents = input.amountCents ?? null;
  if (amountCents !== null && (!Number.isInteger(amountCents) || amountCents < 0)) {
    return { ok: false, message: "金額が不正です" };
  }
  const event: AbTestEvent = {
    id: randomUUID(),
    testId,
    userId,
    visitorId,
    variant: input.variant,
    eventType: input.eventType,
    amountCents,
    createdAt: new Date(),
  };
  events.push(event);
  await persistEvent(event);
  return { ok: true, value: event };
}
