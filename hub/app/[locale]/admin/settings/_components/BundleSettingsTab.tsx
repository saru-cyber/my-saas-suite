"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { PRICING_PATTERN_IDS, isPricingPatternId, patternUsesTrial, type PricingPatternId } from "../../../../../src/commerce/patterns";
import type { PricingConfiguration, ProductBundle } from "../../../../../src/commerce/store";
import { saveBundlePackage, type CommerceErrorCode } from "../commerce-actions";
import { Field, controlClassName, primaryButtonClassName, secondaryButtonClassName } from "./Field";

interface BundleSettingsTabProps {
  products: readonly string[];
  initialBundles: ProductBundle[];
  initialPricing: PricingConfiguration[];
  onBundlesChange: (bundles: ProductBundle[]) => void;
  onToast: (message: string) => void;
}

function messageKey(code: CommerceErrorCode): "forbidden" | "invalid" | "invalidTrial" | "invalidSlug" | "invalidBundle" | "saveFailed" {
  if (code === "forbidden" || code === "invalid" || code === "invalidTrial" || code === "invalidSlug" || code === "invalidBundle") {
    return code;
  }
  return "saveFailed";
}

export function BundleSettingsTab({ products, initialBundles, initialPricing, onBundlesChange, onToast }: BundleSettingsTabProps) {
  const t = useTranslations("admin");
  const [bundles, setBundles] = useState(initialBundles);
  const [pricing, setPricing] = useState(initialPricing);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [included, setIncluded] = useState<string[]>(products.length === 1 && products[0] ? [products[0]] : []);
  const [description, setDescription] = useState("");
  const [patternId, setPatternId] = useState<PricingPatternId>("p05_flat_sub");
  const [stripePriceId, setStripePriceId] = useState("");
  const [currency, setCurrency] = useState("jpy");
  const [trialDays, setTrialDays] = useState("14");
  const [isActive, setIsActive] = useState(true);
  const [pending, setPending] = useState(false);

  function resetForm(): void {
    setEditingId(null);
    setName("");
    setSlug("");
    setIncluded(products.length === 1 && products[0] ? [products[0]] : []);
    setDescription("");
    setPatternId("p05_flat_sub");
    setStripePriceId("");
    setCurrency("jpy");
    setTrialDays("14");
    setIsActive(true);
  }

  function selectBundle(bundle: ProductBundle): void {
    const price = pricing.find((row) => row.targetId === bundle.id && row.isActive) ?? pricing.find((row) => row.targetId === bundle.id);
    setEditingId(bundle.id);
    setName(bundle.name);
    setSlug(bundle.slug);
    setIncluded(bundle.includedProductIds);
    setDescription(bundle.description);
    setPatternId(price && isPricingPatternId(price.patternId) ? price.patternId : "p05_flat_sub");
    setStripePriceId(price?.stripePriceId ?? "");
    setCurrency(price?.currency ?? "jpy");
    setTrialDays(String(price?.trialDays && price.trialDays > 0 ? price.trialDays : 14));
    setIsActive(price?.isActive ?? true);
  }

  function toggleProduct(productId: string): void {
    setIncluded((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsedTrial = patternUsesTrial(patternId) ? Number(trialDays) : 0;
    if (patternUsesTrial(patternId) && !Number.isInteger(parsedTrial)) {
      onToast(t("invalidTrial"));
      return;
    }
    setPending(true);
    try {
      const result = await saveBundlePackage({
        id: editingId ?? undefined,
        name,
        slug,
        includedProductIds: included,
        description,
        patternId,
        stripePriceId,
        currency,
        trialDays: parsedTrial,
        isActive,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setBundles(result.value.bundles);
      setPricing(result.value.pricing);
      onBundlesChange(result.value.bundles);
      setEditingId(result.value.bundle.id);
      onToast(t("saved"));
    } catch {
      onToast(t("saveFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("tabs.bundles")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("bundlesLead")}</p>
      </div>
      <div className="flex flex-col gap-2 border-b border-border/40 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">{t("bundleList")}</h3>
          <button type="button" className={secondaryButtonClassName} onClick={resetForm}>
            {t("newBundle")}
          </button>
        </div>
        {bundles.length === 0 ? <p className="text-sm text-muted-foreground">{t("bundlesEmpty")}</p> : null}
        <div className="flex gap-2 overflow-x-auto">
          {bundles.map((bundle) => {
            const selected = editingId === bundle.id;
            return (
              <button
                key={bundle.id}
                type="button"
                aria-pressed={selected}
                className={
                  selected
                    ? "shrink-0 rounded-md bg-muted px-3 py-2 text-left text-sm font-medium text-foreground"
                    : "shrink-0 rounded-md border border-border/40 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
                }
                onClick={() => selectBundle(bundle)}
              >
                <span className="block">{bundle.name}</span>
                <span className="block font-mono text-xs text-muted-foreground">{bundle.slug}</span>
              </button>
            );
          })}
        </div>
      </div>
      <form className="flex flex-col gap-5" onSubmit={(event) => void onSubmit(event)}>
        <Field id="bundle-name" label={t("bundleName")}>
          <input id="bundle-name" className={controlClassName} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field id="bundle-slug" label={t("bundleSlug")} hint={t("bundleSlugHint")}>
          <input
            id="bundle-slug"
            className={`${controlClassName} font-mono`}
            value={slug}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setSlug(event.target.value)}
          />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium text-foreground">{t("includedProducts")}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {products.map((productId) => (
              <label key={productId} className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={included.includes(productId)}
                  onChange={() => toggleProduct(productId)}
                />
                <span className="font-mono">{productId}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="bundle-pattern" label={t("pricingPattern")}>
          <select
            id="bundle-pattern"
            className={controlClassName}
            value={patternId}
            onChange={(event) => {
              if (isPricingPatternId(event.target.value)) {
                setPatternId(event.target.value);
              }
            }}
          >
            {PRICING_PATTERN_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`patterns.${id}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field id="bundle-price" label={t("stripePriceId")}>
          <input
            id="bundle-price"
            className={`${controlClassName} font-mono`}
            value={stripePriceId}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setStripePriceId(event.target.value)}
          />
        </Field>
        {patternUsesTrial(patternId) ? (
          <Field id="bundle-trial" label={t("trialDays")} hint={t("trialDaysHint")}>
            <input id="bundle-trial" className={controlClassName} inputMode="numeric" value={trialDays} onChange={(event) => setTrialDays(event.target.value)} />
          </Field>
        ) : null}
        <Field id="bundle-currency" label={t("currency")} hint={t("currencyHint")}>
          <input
            id="bundle-currency"
            className={`${controlClassName} uppercase`}
            value={currency}
            maxLength={3}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setCurrency(event.target.value)}
          />
        </Field>
        <Field id="bundle-description" label={t("bundleDescription")}>
          <textarea
            id="bundle-description"
            className={`${controlClassName} min-h-24`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div>
          <button
            type="button"
            aria-pressed={isActive}
            className={
              isActive
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-md border border-border/40 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
            }
            onClick={() => setIsActive((current) => !current)}
          >
            {isActive ? t("active") : t("inactive")}
          </button>
        </div>
        <div>
          <button className={primaryButtonClassName} type="submit" disabled={pending}>
            {pending ? t("saving") : editingId ? t("updateBundle") : t("createBundle")}
          </button>
        </div>
      </form>
    </div>
  );
}
