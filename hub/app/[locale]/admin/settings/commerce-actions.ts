"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../src/auth/session";
import { isPricingPatternId, patternUsesTrial } from "../../../../src/commerce/patterns";
import type { AbTestEventView } from "../../../../src/commerce/report";
import {
  listAbTestEvents,
  listAbTests,
  listPricingConfigurations,
  listProductBundles,
  saveAbTest,
  savePricingConfiguration,
  saveProductBundle,
  type AbTest,
  type AbTestStatus,
  type PricingConfiguration,
  type ProductBundle,
} from "../../../../src/commerce/store";
import { suiteProducts } from "../../../../src/products/catalog";

export type CommerceErrorCode = "forbidden" | "invalid" | "invalidTrial" | "invalidRatio" | "invalidSlug" | "invalidBundle";

export type CommerceActionResult<T> = { ok: true; value: T } | { ok: false; code: CommerceErrorCode };

const STATUSES: readonly AbTestStatus[] = ["draft", "running", "paused", "finished"];

function isStatus(value: string): value is AbTestStatus {
  return STATUSES.some((status) => status === value);
}

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  return session?.isAdmin === true;
}

function readBoundedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength || trimmed.includes("\0")) {
    return null;
  }
  return trimmed;
}

function readCurrency(value: unknown): string | null {
  const currency = readBoundedText(value, 3)?.toLowerCase() ?? null;
  if (!currency || !/^[a-z]{3}$/.test(currency)) {
    return null;
  }
  return currency;
}

function readTrialDays(patternId: string, value: unknown): number | null {
  if (!patternUsesTrial(patternId)) {
    return 0;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 730) {
    return null;
  }
  return value;
}

function isKnownProduct(productId: string): boolean {
  return suiteProducts.some((product) => product.id === productId);
}

function toEventView(event: {
  id: string;
  testId: string;
  userId: string | null;
  visitorId: string | null;
  variant: "A" | "B";
  eventType: "impression" | "checkout_start" | "conversion";
  amountCents: number | null;
  createdAt: Date;
}): AbTestEventView {
  return {
    id: event.id,
    testId: event.testId,
    userId: event.userId,
    visitorId: event.visitorId,
    variant: event.variant,
    eventType: event.eventType,
    amountCents: event.amountCents,
    createdAt: event.createdAt.toISOString(),
  };
}

export async function saveProductPricing(input: {
  targetId: string;
  patternId: string;
  stripePriceId: string;
  currency: string;
  trialDays: number;
  isActive: boolean;
}): Promise<CommerceActionResult<PricingConfiguration[]>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }
  const targetId = readBoundedText(input.targetId, 80);
  const patternId = readBoundedText(input.patternId, 80);
  const stripePriceId = readBoundedText(input.stripePriceId, 120);
  const currency = readCurrency(input.currency);
  if (!targetId || !isKnownProduct(targetId) || !patternId || !isPricingPatternId(patternId) || !stripePriceId || !currency || typeof input.isActive !== "boolean") {
    return { ok: false, code: "invalid" };
  }
  const trialDays = readTrialDays(patternId, input.trialDays);
  if (trialDays === null) {
    return { ok: false, code: "invalidTrial" };
  }
  const saved = await savePricingConfiguration({
    targetId,
    patternId,
    stripePriceId,
    currency,
    trialDays,
    isActive: input.isActive,
  });
  if (!saved.ok) {
    return { ok: false, code: "invalid" };
  }
  return { ok: true, value: await listPricingConfigurations() };
}

export async function saveBundlePackage(input: {
  id?: string;
  name: string;
  slug: string;
  includedProductIds: string[];
  description: string;
  patternId: string;
  stripePriceId: string;
  currency: string;
  trialDays: number;
  isActive: boolean;
}): Promise<CommerceActionResult<{ bundle: ProductBundle; bundles: ProductBundle[]; pricing: PricingConfiguration[] }>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }
  const name = readBoundedText(input.name, 120);
  const slug = readBoundedText(input.slug, 80)?.toLowerCase() ?? null;
  const description = typeof input.description === "string" ? input.description.trim() : null;
  const patternId = readBoundedText(input.patternId, 80);
  const stripePriceId = readBoundedText(input.stripePriceId, 120);
  const currency = readCurrency(input.currency);
  const id = input.id === undefined || input.id === "" ? undefined : readBoundedText(input.id, 80) ?? undefined;
  if (input.id && !id) {
    return { ok: false, code: "invalid" };
  }
  if (!name || !slug || description === null || description.length > 2000 || !patternId || !isPricingPatternId(patternId) || !stripePriceId || !currency || typeof input.isActive !== "boolean") {
    return { ok: false, code: slug ? "invalid" : "invalidSlug" };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, code: "invalidSlug" };
  }
  if (!Array.isArray(input.includedProductIds) || input.includedProductIds.length === 0 || input.includedProductIds.some((productId) => !isKnownProduct(productId))) {
    return { ok: false, code: "invalidBundle" };
  }
  const trialDays = readTrialDays(patternId, input.trialDays);
  if (trialDays === null) {
    return { ok: false, code: "invalidTrial" };
  }

  const bundle = await saveProductBundle({
    id,
    name,
    slug,
    includedProductIds: input.includedProductIds,
    description,
  });
  if (!bundle.ok) {
    return { ok: false, code: bundle.message.includes("スラッグ") ? "invalidSlug" : "invalidBundle" };
  }
  const pricing = await savePricingConfiguration({
    targetId: bundle.value.id,
    patternId,
    stripePriceId,
    currency,
    trialDays,
    isActive: input.isActive,
  });
  if (!pricing.ok) {
    return { ok: false, code: "invalid" };
  }
  return {
    ok: true,
    value: {
      bundle: bundle.value,
      bundles: await listProductBundles(),
      pricing: await listPricingConfigurations(),
    },
  };
}

export async function saveExperiment(input: {
  id?: string;
  name: string;
  targetId: string;
  status: string;
  trafficRatioA: number;
  variantAPatternId: string;
  variantAPriceId: string;
  variantBPatternId: string;
  variantBPriceId: string;
}): Promise<CommerceActionResult<{ test: AbTest; tests: AbTest[] }>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }
  const name = readBoundedText(input.name, 120);
  const targetId = readBoundedText(input.targetId, 80);
  const variantAPatternId = readBoundedText(input.variantAPatternId, 80);
  const variantAPriceId = readBoundedText(input.variantAPriceId, 120);
  const variantBPatternId = readBoundedText(input.variantBPatternId, 80);
  const variantBPriceId = readBoundedText(input.variantBPriceId, 120);
  const id = input.id === undefined || input.id === "" ? undefined : readBoundedText(input.id, 80) ?? undefined;
  if (input.id && !id) {
    return { ok: false, code: "invalid" };
  }
  if (!name || !targetId || !variantAPatternId || !variantAPriceId || !variantBPatternId || !variantBPriceId || !isPricingPatternId(variantAPatternId) || !isPricingPatternId(variantBPatternId) || !isStatus(input.status)) {
    return { ok: false, code: "invalid" };
  }
  if (typeof input.trafficRatioA !== "number" || !Number.isInteger(input.trafficRatioA) || input.trafficRatioA < 0 || input.trafficRatioA > 100) {
    return { ok: false, code: "invalidRatio" };
  }
  const bundles = await listProductBundles();
  const targetKnown = isKnownProduct(targetId) || bundles.some((bundle) => bundle.id === targetId);
  if (!targetKnown) {
    return { ok: false, code: "invalid" };
  }
  const saved = await saveAbTest({
    id,
    name,
    targetId,
    status: input.status,
    trafficRatioA: input.trafficRatioA,
    variantAPatternId,
    variantAPriceId,
    variantBPatternId,
    variantBPriceId,
  });
  if (!saved.ok) {
    return { ok: false, code: "invalid" };
  }
  return { ok: true, value: { test: saved.value, tests: await listAbTests() } };
}

export async function loadExperimentReport(): Promise<CommerceActionResult<{ tests: AbTest[]; events: AbTestEventView[] }>> {
  if (!(await requireAdmin())) {
    return { ok: false, code: "forbidden" };
  }
  const [tests, events] = await Promise.all([listAbTests(), listAbTestEvents()]);
  return { ok: true, value: { tests, events: events.map(toEventView) } };
}
