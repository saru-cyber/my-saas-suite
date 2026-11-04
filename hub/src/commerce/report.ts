export interface AbTestEventView {
  id: string;
  testId: string;
  userId: string | null;
  visitorId: string | null;
  variant: "A" | "B";
  eventType: "impression" | "checkout_start" | "conversion";
  amountCents: number | null;
  createdAt: string;
}

export interface VariantMetrics {
  variant: "A" | "B";
  impressions: number;
  checkoutStarts: number;
  checkoutRate: number | null;
  conversions: number;
  conversionRate: number | null;
  revenueMinor: number;
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export function summarizeVariant(events: readonly AbTestEventView[], testId: string, variant: "A" | "B"): VariantMetrics {
  const impressionIds = new Set<string>();
  let checkoutStarts = 0;
  let conversions = 0;
  let revenueMinor = 0;

  for (const event of events) {
    if (event.testId !== testId || event.variant !== variant) {
      continue;
    }
    if (event.eventType === "impression") {
      const identity = event.userId ?? event.visitorId;
      if (identity) {
        impressionIds.add(identity);
      }
    } else if (event.eventType === "checkout_start") {
      checkoutStarts += 1;
    } else {
      conversions += 1;
      revenueMinor += event.amountCents ?? 0;
    }
  }

  const impressions = impressionIds.size;
  return {
    variant,
    impressions,
    checkoutStarts,
    checkoutRate: impressions === 0 ? null : (checkoutStarts / impressions) * 100,
    conversions,
    conversionRate: impressions === 0 ? null : (conversions / impressions) * 100,
    revenueMinor,
  };
}

export function formatRate(rate: number | null, locale: string): string | null {
  if (rate === null || !Number.isFinite(rate)) {
    return null;
  }
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(rate);
  return `${formatted}%`;
}

export function formatRevenue(minor: number, currency: string, locale: string): string {
  const code = currency.trim().toLowerCase();
  const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);
  const amount = zeroDecimal ? minor : minor / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code.toUpperCase(),
      maximumFractionDigits: zeroDecimal ? 0 : 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(locale).format(minor);
  }
}
