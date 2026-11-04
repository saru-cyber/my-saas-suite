export const PRICING_PATTERN_IDS = ["p05_flat_sub", "p06_trial_sub", "p01_digital_download"] as const;

export type PricingPatternId = (typeof PRICING_PATTERN_IDS)[number];

export function isPricingPatternId(value: string): value is PricingPatternId {
  return PRICING_PATTERN_IDS.some((patternId) => patternId === value);
}

export function patternUsesTrial(patternId: string): boolean {
  return patternId === "p06_trial_sub";
}
