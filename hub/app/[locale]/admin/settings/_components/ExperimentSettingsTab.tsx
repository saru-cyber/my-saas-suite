"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PRICING_PATTERN_IDS, isPricingPatternId, type PricingPatternId } from "../../../../../src/commerce/patterns";
import { formatRate, formatRevenue, summarizeVariant, type AbTestEventView } from "../../../../../src/commerce/report";
import type { AbTest, AbTestStatus, ProductBundle } from "../../../../../src/commerce/store";
import { loadExperimentReport, saveExperiment, type CommerceErrorCode } from "../commerce-actions";
import { Field, controlClassName, primaryButtonClassName, secondaryButtonClassName } from "./Field";

const STATUSES: readonly AbTestStatus[] = ["draft", "running", "paused", "finished"];

interface ExperimentSettingsTabProps {
  products: readonly string[];
  bundles: ProductBundle[];
  initialTests: AbTest[];
  initialEvents: AbTestEventView[];
  onToast: (message: string) => void;
}

function messageKey(code: CommerceErrorCode): "forbidden" | "invalid" | "invalidRatio" | "saveFailed" {
  if (code === "forbidden" || code === "invalid" || code === "invalidRatio") {
    return code;
  }
  return "saveFailed";
}

export function ExperimentSettingsTab({ products, bundles, initialTests, initialEvents, onToast }: ExperimentSettingsTabProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [tests, setTests] = useState(initialTests);
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<"product" | "bundle">("product");
  const [targetId, setTargetId] = useState(products[0] ?? "");
  const [trafficRatioA, setTrafficRatioA] = useState("50");
  const [variantAPatternId, setVariantAPatternId] = useState<PricingPatternId>("p05_flat_sub");
  const [variantAPriceId, setVariantAPriceId] = useState("");
  const [variantBPatternId, setVariantBPatternId] = useState<PricingPatternId>("p06_trial_sub");
  const [variantBPriceId, setVariantBPriceId] = useState("");
  const [status, setStatus] = useState<AbTestStatus>("draft");
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const targets = entityType === "product"
    ? products.map((id) => ({ id, label: id }))
    : bundles.map((bundle) => ({ id: bundle.id, label: `${bundle.name} (${bundle.slug})` }));
  const ratio = Number(trafficRatioA);
  const remainder = Number.isInteger(ratio) ? Math.max(0, 100 - ratio) : 50;

  useEffect(() => {
    if (entityType === "bundle" && targetId.length === 0 && bundles[0]) {
      setTargetId(bundles[0].id);
    }
  }, [bundles, entityType, targetId]);

  function resetForm(): void {
    setEditingId(null);
    setName("");
    setEntityType("product");
    setTargetId(products[0] ?? "");
    setTrafficRatioA("50");
    setVariantAPatternId("p05_flat_sub");
    setVariantAPriceId("");
    setVariantBPatternId("p06_trial_sub");
    setVariantBPriceId("");
    setStatus("draft");
  }

  function selectTest(test: AbTest): void {
    const nextEntity = bundles.some((bundle) => bundle.id === test.targetId) ? "bundle" : "product";
    setEditingId(test.id);
    setName(test.name);
    setEntityType(nextEntity);
    setTargetId(test.targetId);
    setTrafficRatioA(String(test.trafficRatioA));
    setVariantAPatternId(isPricingPatternId(test.variantAPatternId) ? test.variantAPatternId : "p05_flat_sub");
    setVariantAPriceId(test.variantAPriceId);
    setVariantBPatternId(isPricingPatternId(test.variantBPatternId) ? test.variantBPatternId : "p06_trial_sub");
    setVariantBPriceId(test.variantBPriceId);
    setStatus(test.status);
  }

  function changeEntity(next: "product" | "bundle"): void {
    setEntityType(next);
    const options = next === "product" ? products.map((id) => id) : bundles.map((bundle) => bundle.id);
    setTargetId(options[0] ?? "");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!Number.isInteger(ratio) || ratio < 0 || ratio > 100) {
      onToast(t("invalidRatio"));
      return;
    }
    if (targetId.length === 0) {
      onToast(t("noTargets"));
      return;
    }
    setPending(true);
    try {
      const result = await saveExperiment({
        id: editingId ?? undefined,
        name,
        targetId,
        status,
        trafficRatioA: ratio,
        variantAPatternId,
        variantAPriceId,
        variantBPatternId,
        variantBPriceId,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setTests(result.value.tests);
      setEditingId(result.value.test.id);
      onToast(t("saved"));
    } catch {
      onToast(t("saveFailed"));
    } finally {
      setPending(false);
    }
  }

  async function refreshReport(): Promise<void> {
    setRefreshing(true);
    try {
      const result = await loadExperimentReport();
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setTests(result.value.tests);
      setEvents(result.value.events);
    } catch {
      onToast(t("saveFailed"));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("tabs.experiments")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("experimentsLead")}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">{t("experimentList")}</h3>
          <button type="button" className={secondaryButtonClassName} onClick={resetForm}>
            {t("newExperiment")}
          </button>
        </div>
        {tests.length === 0 ? <p className="text-sm text-muted-foreground">{t("experimentsEmpty")}</p> : null}
        <div className="flex gap-2 overflow-x-auto">
          {tests.map((test) => {
            const selected = editingId === test.id;
            return (
              <button
                key={test.id}
                type="button"
                aria-pressed={selected}
                className={
                  selected
                    ? "shrink-0 rounded-md bg-muted px-3 py-2 text-left text-sm font-medium text-foreground"
                    : "shrink-0 rounded-md border border-border/40 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
                }
                onClick={() => selectTest(test)}
              >
                <span className="block">{test.name}</span>
                <span className="block font-mono text-xs text-muted-foreground">{test.targetId}</span>
              </button>
            );
          })}
        </div>
      </div>
      <form className="flex flex-col gap-5 border-b border-border/40 pb-8" onSubmit={(event) => void onSubmit(event)}>
        <Field id="experiment-name" label={t("experimentName")}>
          <input id="experiment-name" className={controlClassName} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium text-foreground">{t("entityType")}</legend>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {(["product", "bundle"] as const).map((item) => {
              const selected = entityType === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  className={
                    selected
                      ? "shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                      : "shrink-0 rounded-md border border-border/40 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-muted/80"
                  }
                  onClick={() => changeEntity(item)}
                >
                  {t(item === "product" ? "entityProduct" : "entityBundle")}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field id="experiment-target" label={t("target")} hint={targets.length === 0 ? t("noTargets") : undefined}>
          <select id="experiment-target" className={controlClassName} value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            {targets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="traffic-ratio" label={t("trafficRatio")} hint={t("trafficRatioHint", { remainder: String(remainder) })}>
          <input
            id="traffic-ratio"
            className={controlClassName}
            inputMode="numeric"
            value={trafficRatioA}
            onChange={(event) => setTrafficRatioA(event.target.value)}
          />
        </Field>
        <VariantFields
          title={t("variantA")}
          patternInputId="variant-a-pattern"
          priceInputId="variant-a-price"
          patternId={variantAPatternId}
          priceId={variantAPriceId}
          patternLabel={t("patternId")}
          priceLabel={t("stripePriceId")}
          onPattern={(value) => setVariantAPatternId(value)}
          onPrice={setVariantAPriceId}
          patternName={(id) => t(`patterns.${id}`)}
        />
        <VariantFields
          title={t("variantB")}
          patternInputId="variant-b-pattern"
          priceInputId="variant-b-price"
          patternId={variantBPatternId}
          priceId={variantBPriceId}
          patternLabel={t("patternId")}
          priceLabel={t("stripePriceId")}
          onPattern={(value) => setVariantBPatternId(value)}
          onPrice={setVariantBPriceId}
          patternName={(id) => t(`patterns.${id}`)}
        />
        <fieldset>
          <legend className="text-sm font-medium text-foreground">{t("status")}</legend>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {STATUSES.map((item) => {
              const selected = status === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  className={
                    selected
                      ? "shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                      : "shrink-0 rounded-md border border-border/40 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-muted/80"
                  }
                  onClick={() => setStatus(item)}
                >
                  {t(`statuses.${item}`)}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div>
          <button className={primaryButtonClassName} type="submit" disabled={pending || targets.length === 0}>
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">{t("reportTitle")}</h3>
          <button type="button" className={secondaryButtonClassName} disabled={refreshing} onClick={() => void refreshReport()}>
            {refreshing ? t("saving") : t("refreshReport")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t("reportCaption")}</p>
        {tests.length === 0 ? <p className="text-sm text-muted-foreground">{t("experimentsEmpty")}</p> : null}
        {tests.map((test) => (
          <div key={test.id} className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-foreground">{test.name}</h4>
            <div className="overflow-x-auto border border-border/40">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border/40">
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("variant")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("impressions")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("checkoutStarts")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("checkoutRate")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("conversions")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("conversionRate")}</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap" scope="col">{t("revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(["A", "B"] as const).map((variant) => {
                    const metrics = summarizeVariant(events, test.id, variant);
                    const checkoutRate = formatRate(metrics.checkoutRate, locale) ?? t("rateEmpty");
                    const conversionRate = formatRate(metrics.conversionRate, locale) ?? t("rateEmpty");
                    return (
                      <tr key={variant} className="border-b border-border/40 even:bg-muted/30">
                        <th className="px-3 py-2 font-medium text-foreground" scope="row">{variant}</th>
                        <td className="px-3 py-2 text-foreground tabular-nums">{metrics.impressions}</td>
                        <td className="px-3 py-2 text-foreground tabular-nums">{metrics.checkoutStarts}</td>
                        <td className="px-3 py-2 text-foreground tabular-nums">{checkoutRate}</td>
                        <td className="px-3 py-2 text-foreground tabular-nums">{metrics.conversions}</td>
                        <td className="px-3 py-2 text-foreground tabular-nums">{conversionRate}</td>
                        <td className="px-3 py-2 text-foreground tabular-nums">{formatRevenue(metrics.revenueMinor, "jpy", locale)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function VariantFields({
  title,
  patternInputId,
  priceInputId,
  patternId,
  priceId,
  patternLabel,
  priceLabel,
  onPattern,
  onPrice,
  patternName,
}: {
  title: string;
  patternInputId: string;
  priceInputId: string;
  patternId: PricingPatternId;
  priceId: string;
  patternLabel: string;
  priceLabel: string;
  onPattern: (patternId: PricingPatternId) => void;
  onPrice: (priceId: string) => void;
  patternName: (patternId: PricingPatternId) => string;
}) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border/40 pt-4">
      <legend className="text-sm font-medium text-foreground">{title}</legend>
      <Field id={patternInputId} label={patternLabel}>
        <select
          id={patternInputId}
          className={controlClassName}
          value={patternId}
          onChange={(event) => {
            if (isPricingPatternId(event.target.value)) {
              onPattern(event.target.value);
            }
          }}
        >
          {PRICING_PATTERN_IDS.map((id) => (
            <option key={id} value={id}>
              {patternName(id)}
            </option>
          ))}
        </select>
      </Field>
      <Field id={priceInputId} label={priceLabel}>
        <input
          id={priceInputId}
          className={`${controlClassName} font-mono`}
          value={priceId}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onPrice(event.target.value)}
        />
      </Field>
    </fieldset>
  );
}
