"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { BillingMode, BillingSettingsView } from "../../../../../src/settings/store";
import { saveBillingSettings, type SettingsErrorCode } from "../actions";
import { Field, controlClassName, primaryButtonClassName } from "./Field";

const MODES: readonly BillingMode[] = ["mock", "test", "live"];

interface BillingSettingsTabProps {
  initial: BillingSettingsView;
  onToast: (message: string) => void;
}

export function BillingSettingsTab({ initial, onToast }: BillingSettingsTabProps) {
  const t = useTranslations("admin");
  const [publishableKey, setPublishableKey] = useState(initial.publishableKey);
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [secretMask, setSecretMask] = useState(initial.secretKeyMask);
  const [secretConfigured, setSecretConfigured] = useState(initial.secretKeyConfigured);
  const [webhookMask, setWebhookMask] = useState(initial.webhookSecretMask);
  const [webhookConfigured, setWebhookConfigured] = useState(initial.webhookSecretConfigured);
  const [mode, setMode] = useState<BillingMode>(initial.mode);
  const [monthlyPriceId, setMonthlyPriceId] = useState(initial.monthlyPriceId);
  const [yearlyPriceId, setYearlyPriceId] = useState(initial.yearlyPriceId);
  const [pricingTableId, setPricingTableId] = useState(initial.pricingTableId);
  const [runtimeStaysMock, setRuntimeStaysMock] = useState(initial.runtimeStaysMock);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    try {
      const result = await saveBillingSettings({
        publishableKey,
        secretKey,
        webhookSecret,
        mode,
        monthlyPriceId,
        yearlyPriceId,
        pricingTableId,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setPublishableKey(result.settings.publishableKey);
      setSecretKey("");
      setWebhookSecret("");
      setSecretMask(result.settings.secretKeyMask);
      setSecretConfigured(result.settings.secretKeyConfigured);
      setWebhookMask(result.settings.webhookSecretMask);
      setWebhookConfigured(result.settings.webhookSecretConfigured);
      setMode(result.settings.mode);
      setMonthlyPriceId(result.settings.monthlyPriceId);
      setYearlyPriceId(result.settings.yearlyPriceId);
      setPricingTableId(result.settings.pricingTableId);
      setRuntimeStaysMock(result.settings.runtimeStaysMock);
      onToast(t("saved"));
    } catch {
      onToast(t("saveFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => void onSubmit(event)}>
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("tabs.billing")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("billingLead")}</p>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">{t("billingMode")}</legend>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {MODES.map((item) => {
            const selected = mode === item;
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
                onClick={() => setMode(item)}
              >
                {t(`modes.${item}`)}
              </button>
            );
          })}
        </div>
        {runtimeStaysMock ? <p className="mt-2 text-xs text-muted-foreground">{t("runtimeMockHint")}</p> : null}
      </fieldset>
      <Field id="publishable-key" label={t("publishableKey")}>
        <input
          id="publishable-key"
          className={`${controlClassName} font-mono`}
          value={publishableKey}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setPublishableKey(event.target.value)}
        />
      </Field>
      <Field
        id="secret-key"
        label={t("secretKey")}
        hint={secretConfigured ? t("secretConfigured", { mask: secretMask }) : t("secretEmpty")}
      >
        <input
          id="secret-key"
          className={`${controlClassName} font-mono`}
          type="password"
          value={secretKey}
          autoComplete="off"
          placeholder={t("secretPlaceholder")}
          onChange={(event) => setSecretKey(event.target.value)}
        />
      </Field>
      <Field
        id="webhook-secret"
        label={t("webhookSecret")}
        hint={webhookConfigured ? t("secretConfigured", { mask: webhookMask }) : t("secretEmpty")}
      >
        <input
          id="webhook-secret"
          className={`${controlClassName} font-mono`}
          type="password"
          value={webhookSecret}
          autoComplete="off"
          placeholder={t("secretPlaceholder")}
          onChange={(event) => setWebhookSecret(event.target.value)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="monthly-price" label={t("monthlyPriceId")}>
          <input
            id="monthly-price"
            className={`${controlClassName} font-mono`}
            value={monthlyPriceId}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setMonthlyPriceId(event.target.value)}
          />
        </Field>
        <Field id="yearly-price" label={t("yearlyPriceId")}>
          <input
            id="yearly-price"
            className={`${controlClassName} font-mono`}
            value={yearlyPriceId}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setYearlyPriceId(event.target.value)}
          />
        </Field>
      </div>
      <Field id="pricing-table" label={t("pricingTableId")}>
        <input
          id="pricing-table"
          className={`${controlClassName} font-mono`}
          value={pricingTableId}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setPricingTableId(event.target.value)}
        />
      </Field>
      <div>
        <button className={primaryButtonClassName} type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

function messageKey(code: SettingsErrorCode): "forbidden" | "invalid" | "saveFailed" {
  if (code === "forbidden") {
    return "forbidden";
  }
  return code === "invalid" ? "invalid" : "saveFailed";
}
