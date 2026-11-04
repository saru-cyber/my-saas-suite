"use client";

import { CreditCard, FlaskConical, KeyRound, Package, Palette, Tags, type LucideIcon } from "lucide-react";
import { useCallback, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { AbTestEventView } from "../../../../../src/commerce/report";
import type { AbTest, PricingConfiguration, ProductBundle } from "../../../../../src/commerce/store";
import type { AppearanceSettings } from "../../../../../src/settings/appearance";
import type { AuthSettingsView, BillingSettingsView } from "../../../../../src/settings/store";
import { Link } from "../../../../../i18n/navigation";
import { AppearanceSettingsTab } from "./AppearanceSettingsTab";
import { AuthSettingsTab } from "./AuthSettingsTab";
import { BillingSettingsTab } from "./BillingSettingsTab";
import { BundleSettingsTab } from "./BundleSettingsTab";
import { ExperimentSettingsTab } from "./ExperimentSettingsTab";
import { PricingSettingsTab } from "./PricingSettingsTab";
import { Toast } from "./Toast";

type SettingsTab = "auth" | "billing" | "pricing" | "bundles" | "experiments" | "appearance";

const TABS: readonly SettingsTab[] = ["auth", "billing", "pricing", "bundles", "experiments", "appearance"];

const TAB_ICONS: Record<SettingsTab, LucideIcon> = {
  auth: KeyRound,
  billing: CreditCard,
  pricing: Tags,
  bundles: Package,
  experiments: FlaskConical,
  appearance: Palette,
};

interface SettingsConsoleProps {
  auth: AuthSettingsView;
  billing: BillingSettingsView;
  appearance: AppearanceSettings;
  callbackUrl: string;
  products: readonly string[];
  pricing: PricingConfiguration[];
  bundles: ProductBundle[];
  tests: AbTest[];
  events: AbTestEventView[];
}

export function SettingsConsole({ auth, billing, appearance, callbackUrl, products, pricing, bundles, tests, events }: SettingsConsoleProps) {
  const t = useTranslations("admin");
  const [tab, setTab] = useState<SettingsTab>("auth");
  const [bundleList, setBundleList] = useState(bundles);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function selectTab(next: SettingsTab): void {
    setTab(next);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const index = TABS.indexOf(tab);
    if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = TABS[(index + direction + TABS.length) % TABS.length] ?? "auth";
    setTab(next);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-6 pb-24 md:px-8 md:pt-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lead")}</p>
        <Link href="/dashboard" className="mt-3 inline-flex text-sm font-medium text-primary">
          {t("back")}
        </Link>
      </header>
      <div className="mt-8 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
        <div
          role="tablist"
          aria-orientation="vertical"
          className="flex gap-2 overflow-x-auto border-b border-border/40 pb-3 md:flex-col md:overflow-visible md:border-r md:border-b-0 md:pr-4 md:pb-0"
          onKeyDown={onTabKeyDown}
        >
          {TABS.map((item) => {
            const selected = tab === item;
            const Icon = TAB_ICONS[item];
            return (
              <button
                key={item}
                id={`settings-tab-${item}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`settings-panel-${item}`}
                tabIndex={selected ? 0 : -1}
                className={
                  selected
                    ? "inline-flex shrink-0 items-center gap-2 rounded-md bg-muted px-3 py-2 text-left text-sm font-medium text-foreground"
                    : "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted/50"
                }
                onClick={() => selectTab(item)}
              >
                <Icon className="size-4" aria-hidden />
                {t(`tabs.${item}`)}
              </button>
            );
          })}
        </div>
        <div className="min-w-0 pt-6 md:pt-0">
          <div id="settings-panel-auth" role="tabpanel" aria-labelledby="settings-tab-auth" hidden={tab !== "auth"}>
            <AuthSettingsTab initial={auth} callbackUrl={callbackUrl} onToast={setToast} />
          </div>
          <div id="settings-panel-billing" role="tabpanel" aria-labelledby="settings-tab-billing" hidden={tab !== "billing"}>
            <BillingSettingsTab initial={billing} onToast={setToast} />
          </div>
          <div id="settings-panel-pricing" role="tabpanel" aria-labelledby="settings-tab-pricing" hidden={tab !== "pricing"}>
            <PricingSettingsTab products={products} initial={pricing} onToast={setToast} />
          </div>
          <div id="settings-panel-bundles" role="tabpanel" aria-labelledby="settings-tab-bundles" hidden={tab !== "bundles"}>
            <BundleSettingsTab
              products={products}
              initialBundles={bundles}
              initialPricing={pricing}
              onBundlesChange={setBundleList}
              onToast={setToast}
            />
          </div>
          <div id="settings-panel-experiments" role="tabpanel" aria-labelledby="settings-tab-experiments" hidden={tab !== "experiments"}>
            <ExperimentSettingsTab products={products} bundles={bundleList} initialTests={tests} initialEvents={events} onToast={setToast} />
          </div>
          <div
            id="settings-panel-appearance"
            role="tabpanel"
            aria-labelledby="settings-tab-appearance"
            hidden={tab !== "appearance"}
          >
            <AppearanceSettingsTab initial={appearance} onToast={setToast} />
          </div>
        </div>
      </div>
      {toast ? <Toast message={toast} onDismiss={dismissToast} /> : null}
    </main>
  );
}
