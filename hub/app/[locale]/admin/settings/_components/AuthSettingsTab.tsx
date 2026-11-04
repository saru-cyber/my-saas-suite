"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { AuthSettingsView } from "../../../../../src/settings/store";
import { saveAuthSettings, type SettingsErrorCode } from "../actions";
import { Field, controlClassName, primaryButtonClassName } from "./Field";

interface AuthSettingsTabProps {
  initial: AuthSettingsView;
  callbackUrl: string;
  onToast: (message: string) => void;
}

export function AuthSettingsTab({ initial, callbackUrl, onToast }: AuthSettingsTabProps) {
  const t = useTranslations("admin");
  const [clientId, setClientId] = useState(initial.googleClientId);
  const [clientSecret, setClientSecret] = useState("");
  const [secretMask, setSecretMask] = useState(initial.clientSecretMask);
  const [secretConfigured, setSecretConfigured] = useState(initial.clientSecretConfigured);
  const [sessionTtlHours, setSessionTtlHours] = useState(String(initial.sessionTtlHours));
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCallbackUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast(t("copyFailed"));
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsedTtl = Number(sessionTtlHours);
    if (!Number.isInteger(parsedTtl)) {
      onToast(t("invalidTtl"));
      return;
    }

    setPending(true);
    try {
      const result = await saveAuthSettings({
        googleClientId: clientId,
        googleClientSecret: clientSecret,
        sessionTtlHours: parsedTtl,
      });
      if (!result.ok) {
        onToast(t(messageKey(result.code)));
        return;
      }
      setClientId(result.settings.googleClientId);
      setClientSecret("");
      setSecretMask(result.settings.clientSecretMask);
      setSecretConfigured(result.settings.clientSecretConfigured);
      setSessionTtlHours(String(result.settings.sessionTtlHours));
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
        <h2 className="text-base font-semibold text-foreground">{t("tabs.auth")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("authLead")}</p>
      </div>
      <Field id="google-callback" label={t("callbackLabel")} hint={t("callbackHint")}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="google-callback"
            className={controlClassName}
            readOnly
            value={callbackUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-border/40 bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-150 ease-out hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            onClick={() => void copyCallbackUrl()}
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </Field>
      <Field id="google-client-id" label={t("clientId")}>
        <input
          id="google-client-id"
          className={controlClassName}
          value={clientId}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setClientId(event.target.value)}
        />
      </Field>
      <Field
        id="google-client-secret"
        label={t("clientSecret")}
        hint={secretConfigured ? t("secretConfigured", { mask: secretMask }) : t("secretEmpty")}
      >
        <input
          id="google-client-secret"
          className={controlClassName}
          type="password"
          value={clientSecret}
          autoComplete="off"
          placeholder={t("secretPlaceholder")}
          onChange={(event) => setClientSecret(event.target.value)}
        />
      </Field>
      <Field id="session-ttl" label={t("sessionTtl")} hint={t("sessionTtlHint")}>
        <input
          id="session-ttl"
          className={controlClassName}
          inputMode="numeric"
          value={sessionTtlHours}
          onChange={(event) => setSessionTtlHours(event.target.value)}
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

function messageKey(code: SettingsErrorCode): "forbidden" | "invalid" | "invalidTtl" | "saveFailed" {
  if (code === "forbidden") {
    return "forbidden";
  }
  if (code === "invalidTtl") {
    return "invalidTtl";
  }
  return code === "invalid" ? "invalid" : "saveFailed";
}
