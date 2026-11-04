"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { PRICING_PATTERN_IDS, isPricingPatternId, patternUsesTrial, type PricingPatternId } from "../../../../../src/commerce/patterns";
import type { PricingConfiguration } from "../../../../../src/commerce/store";
import { saveProductPricing, type CommerceErrorCode } from "../commerce-actions";
import { Field, controlClassName, primaryButtonClassName } from "./Field";

interface PricingDraft {
  patternId: PricingPatternId;
  stripePriceId: string;
  currency: string;
  trialDays: string;
  isActive: boolean;
}

interface PricingSettingsTabProps {
  products: readonly string[];
  initial: PricingConfiguration[];
  onToast: (message: string) => void;
}

function draftFor(configs: readonly PricingConfiguration[], productId: string, patternId?: string): PricingDraft {
  const matches = configs.filter((row) => row.targetId === productId);
  const selected = patternId ? matches.find((row) => row.patternId === patternId) : matches.find((row) => row.isActive) ?? matches[0];
  const nextPattern = selected && isPricingPatternId(selected.patternId) ? selected.patternId : "p05_flat_sub";
  return {
    patternId: patternId && isPricingPatternId(patternId) ? patternId : nextPattern,
    stripePriceId: selected?.stripePriceId ?? "",
    currency: selected?.currency ?? "jpy",
    trialDays: String(selected?.trialDays ?? 14),
    isActive: selected?.isActive ?? matches.length === 0,
  };
}

function messageKey(code: CommerceErrorCode): "forbidden" | "invalid" | "invalidTrial" | "saveFailed" {
  if (code === "forbidden" || code === "invalid" || code === "invalidTrial") {
    return code;
  }
  return "saveFailed";
}

export function PricingSettingsTab({ products, initial, onToast }: PricingSettingsTabProps) {
  const t = useTranslations("admin");
  const [pricing, setPricing] = useState(initial);
  const [drafts, setDrafts] = useState<Record<string, PricingDraft>>(() =>
    Object.fromEntries(products.map((productId) => [productId, draftFor(initial, productId)])),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  function updateDraft(productId: string, patch: Partial<PricingDraft>): void {
    setDrafts((current) => {
      const draft = current[productId] ?? draftFor(pricing, productId);
      return { ...current, [productId]: { ...draft, ...patch } };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>, productId: string): Promise<void> {
    event.preventDefault();
    const draft = drafts[productId] ?? draftFor(pricing, productId);
    const trialDays = patternUsesTrial(draft.patternId) ? Number(draft.trialDays) : 0;
    if (patternUsesTrial(draft.patternId) && !Number.isInteger(trialDays)) {
      onToast(t("invalidTrial"));
      return;
    }
    setPendingId(productId);
    try {
      const result = await saveProductPricing({
        targetId: productId,
        patternId: draft.patternId,
        stripePriceId: draft.stripePriceId,
        currency: draft.currency,
        trialDays,
        isActive: draft.isActive,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setPricing(result.value);
      updateDraft(productId, draftFor(result.value, productId, draft.patternId));
      onToast(t("saved"));
    } catch {
      onToast(t("saveFailed"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("tabs.pricing")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("pricingLead")}</p>
      </div>
      {products.map((productId) => {
        const draft = drafts[productId] ?? draftFor(pricing, productId);
        const pending = pendingId === productId;
        return (
          <form
            key={productId}
            className="flex flex-col gap-5 border-b border-border/40 pb-6"
            onSubmit={(event) => void onSubmit(event, productId)}
          >
            <Field id={`product-${productId}`} label={t("targetProduct")}>
              <input id={`product-${productId}`} className={`${controlClassName} font-mono`} value={productId} readOnly />
            </Field>
            <Field id={`pattern-${productId}`} label={t("pricingPattern")}>
              <select
                id={`pattern-${productId}`}
                className={controlClassName}
                value={draft.patternId}
                onChange={(event) => {
                  const patternId = event.target.value;
                  updateDraft(productId, draftFor(pricing, productId, patternId));
                }}
              >
                {PRICING_PATTERN_IDS.map((patternId) => (
                  <option key={patternId} value={patternId}>
                    {t(`patterns.${patternId}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`price-${productId}`} label={t("stripePriceId")}>
              <input
                id={`price-${productId}`}
                className={`${controlClassName} font-mono`}
                value={draft.stripePriceId}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => updateDraft(productId, { stripePriceId: event.target.value })}
              />
            </Field>
            {patternUsesTrial(draft.patternId) ? (
              <Field id={`trial-${productId}`} label={t("trialDays")} hint={t("trialDaysHint")}>
                <input
                  id={`trial-${productId}`}
                  className={controlClassName}
                  inputMode="numeric"
                  value={draft.trialDays}
                  onChange={(event) => updateDraft(productId, { trialDays: event.target.value })}
                />
              </Field>
            ) : null}
            <Field id={`currency-${productId}`} label={t("currency")} hint={t("currencyHint")}>
              <input
                id={`currency-${productId}`}
                className={`${controlClassName} uppercase`}
                value={draft.currency}
                maxLength={3}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => updateDraft(productId, { currency: event.target.value })}
              />
            </Field>
            <div>
              <button
                type="button"
                aria-pressed={draft.isActive}
                className={
                  draft.isActive
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                    : "rounded-md border border-border/40 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                }
                onClick={() => updateDraft(productId, { isActive: !draft.isActive })}
              >
                {draft.isActive ? t("active") : t("inactive")}
              </button>
            </div>
            <div>
              <button className={primaryButtonClassName} type="submit" disabled={pending}>
                {pending ? t("saving") : t("save")}
              </button>
            </div>
          </form>
        );
      })}
    </div>
  );
}
