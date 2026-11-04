"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  applyAppearance,
  isThemeMode,
  type AppearanceSettings,
  type ThemeMode,
} from "../../../../../src/settings/appearance";
import { saveAppearanceSettings, type SettingsErrorCode } from "../actions";
import { Field, controlClassName, primaryButtonClassName } from "./Field";

const THEMES: readonly ThemeMode[] = ["system", "light", "dark"];
const COLOR_INPUT_FALLBACK = "#4F46E5";

interface AppearanceSettingsTabProps {
  initial: AppearanceSettings;
  onToast: (message: string) => void;
}

export function AppearanceSettingsTab({ initial, onToast }: AppearanceSettingsTabProps) {
  const t = useTranslations("admin");
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>(initial.defaultTheme);
  const [pending, setPending] = useState(false);
  const logoReady = isPreviewUrl(logoUrl);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    try {
      const result = await saveAppearanceSettings({
        primaryColor,
        logoUrl,
        defaultTheme,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setPrimaryColor(result.settings.primaryColor);
      setLogoUrl(result.settings.logoUrl);
      if (isThemeMode(result.settings.defaultTheme)) {
        setDefaultTheme(result.settings.defaultTheme);
      }
      applyAppearance(result.settings);
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
        <h2 className="text-base font-semibold text-foreground">{t("tabs.appearance")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("appearanceLead")}</p>
      </div>
      <Field id="primary-color" label={t("primaryColor")} hint={t("primaryColorHint")}>
        <div className="flex items-center gap-3">
          <input
            aria-label={t("primaryColor")}
            className="size-10 shrink-0 cursor-pointer rounded-md border border-border/40 bg-background p-1"
            type="color"
            value={primaryColor.length === 7 ? primaryColor : COLOR_INPUT_FALLBACK}
            onChange={(event) => setPrimaryColor(event.target.value.toUpperCase())}
          />
          <input
            id="primary-color"
            className={`${controlClassName} font-mono`}
            value={primaryColor}
            spellCheck={false}
            placeholder="#4F46E5"
            onChange={(event) => setPrimaryColor(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="self-start text-sm font-medium text-primary"
          onClick={() => setPrimaryColor("")}
        >
          {t("resetColor")}
        </button>
      </Field>
      <Field id="logo-url" label={t("logoUrl")} hint={t("logoHint")}>
        <input
          id="logo-url"
          className={controlClassName}
          value={logoUrl}
          inputMode="url"
          spellCheck={false}
          placeholder="https://"
          onChange={(event) => setLogoUrl(event.target.value)}
        />
      </Field>
      {logoReady ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground">{t("preview")}</p>
          <img src={logoUrl} alt="" className="mt-2 h-10 max-w-48 object-contain" />
        </div>
      ) : null}
      <fieldset>
        <legend className="text-sm font-medium text-foreground">{t("theme")}</legend>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {THEMES.map((item) => {
            const selected = defaultTheme === item;
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
                onClick={() => setDefaultTheme(item)}
              >
                {t(`themes.${item}`)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <button className={primaryButtonClassName} type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

function isPreviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function messageKey(code: SettingsErrorCode): "forbidden" | "invalid" | "invalidColor" | "invalidUrl" | "saveFailed" {
  if (code === "forbidden") {
    return "forbidden";
  }
  if (code === "invalidColor") {
    return "invalidColor";
  }
  if (code === "invalidUrl") {
    return "invalidUrl";
  }
  return code === "invalid" ? "invalid" : "saveFailed";
}
