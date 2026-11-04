import { createHash } from "node:crypto";
import { readBillingSettings } from "../settings/store";
import {
  findPricing,
  getActivePricing,
  getProductBundle,
  getRunningAbTest,
  type AbVariant,
  type PricingConfiguration,
} from "./store";

export interface ResolvedPrice {
  targetId: string;
  entityType: "product" | "bundle";
  patternId: string;
  stripePriceId: string;
  currency: string;
  trialDays: number;
  abTestId: string | null;
  variant: AbVariant | null;
}

export function pricingIdentity(userId: string | null, visitorId: string | null): string {
  const user = userId?.trim() ?? "";
  if (user.length > 0) {
    return `user:${user}`;
  }
  const visitor = visitorId?.trim() ?? "";
  if (visitor.length > 0) {
    return `visitor:${visitor}`;
  }
  return "anonymous";
}

export function assignVariant(testId: string, identity: string, trafficRatioA: number): AbVariant {
  const ratio = Math.min(100, Math.max(0, Math.trunc(trafficRatioA)));
  const digest = createHash("sha256").update(`${testId}:${identity}`).digest();
  const bucket = digest.readUInt32BE(0) % 100;
  return bucket < ratio ? "A" : "B";
}

async function entityTypeFor(targetId: string): Promise<ResolvedPrice["entityType"]> {
  const bundle = await getProductBundle(targetId);
  return bundle ? "bundle" : "product";
}

async function fallbackApp1Price(): Promise<PricingConfiguration> {
  const billing = await readBillingSettings();
  const fromEnv = process.env.STRIPE_PRICE_APP1?.trim() ?? "";
  return {
    id: "env-app1",
    targetId: "app1",
    patternId: "default",
    stripePriceId: fromEnv.length > 0 ? fromEnv : billing.monthlyPriceId,
    currency: "jpy",
    trialDays: 0,
    isActive: true,
  };
}

export async function resolvePricingVariant(
  targetId: string,
  userId: string | null,
  visitorId: string | null,
): Promise<ResolvedPrice | null> {
  const trimmedTarget = targetId.trim();
  if (trimmedTarget.length === 0) {
    return null;
  }

  const entityType = await entityTypeFor(trimmedTarget);
  const test = await getRunningAbTest(trimmedTarget);
  if (test) {
    const variant = assignVariant(test.id, pricingIdentity(userId, visitorId), test.trafficRatioA);
    const patternId = variant === "A" ? test.variantAPatternId : test.variantBPatternId;
    const stripePriceId = variant === "A" ? test.variantAPriceId : test.variantBPriceId;
    const configured = await findPricing(trimmedTarget, patternId);
    return {
      targetId: trimmedTarget,
      entityType,
      patternId,
      stripePriceId,
      currency: configured?.currency ?? "jpy",
      trialDays: configured?.trialDays ?? 0,
      abTestId: test.id,
      variant,
    };
  }

  const active = await getActivePricing(trimmedTarget);
  const price = active ?? (trimmedTarget === "app1" ? await fallbackApp1Price() : null);
  if (!price) {
    return null;
  }
  return {
    targetId: trimmedTarget,
    entityType,
    patternId: price.patternId,
    stripePriceId: price.stripePriceId,
    currency: price.currency,
    trialDays: price.trialDays,
    abTestId: null,
    variant: null,
  };
}
