"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "../../../i18n/navigation";

interface AuthUser {
  userId: string;
  email: string;
  plan: string;
  activeProducts: string[];
  role: "admin" | "member";
}

type Status =
  | { kind: "idle" }
  | { kind: "ok"; text: string }
  | { kind: "error"; text: string };

function readUser(value: unknown): AuthUser | null {
  if (typeof value !== "object" || value === null || !("user" in value)) {
    return null;
  }
  const user: unknown = value.user;
  if (typeof user !== "object" || user === null) {
    return null;
  }
  const record = user as Record<string, unknown>;
  if (
    typeof record.userId !== "string" ||
    typeof record.email !== "string" ||
    typeof record.plan !== "string" ||
    !Array.isArray(record.activeProducts)
  ) {
    return null;
  }
  const activeProducts = record.activeProducts.filter(
    (product): product is string => typeof product === "string",
  );
  return {
    userId: record.userId,
    email: record.email,
    plan: record.plan,
    activeProducts,
    role: record.role === "admin" ? "admin" : "member",
  };
}

function readCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("url" in value)) {
    return null;
  }
  return typeof value.url === "string" ? value.url : null;
}

function localizeDashboardUrl(url: string, locale: string): string {
  const parsed = new URL(url);
  if (parsed.pathname === "/dashboard" || parsed.pathname === "/dashboard/") {
    parsed.pathname = `/${locale}/dashboard`;
  }
  return parsed.toString();
}

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, setPending] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  function messageForStatus(response: Response): string {
    if (response.status === 401) {
      return t("invalidCredentials");
    }
    if (response.status === 409) {
      return t("emailTaken");
    }
    if (response.status === 400) {
      return t("invalidInput");
    }
    return t("network");
  }

  async function submit(path: "/api/auth/login" | "/api/auth/register"): Promise<void> {
    setPending(true);
    setStatus({ kind: "idle" });
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setSessionUser(null);
        setStatus({ kind: "error", text: messageForStatus(response) });
        return;
      }

      if (path === "/api/auth/register") {
        setSessionUser(null);
        setStatus({ kind: "ok", text: t("registered") });
        return;
      }

      const sessionResponse = await fetch("/api/auth/session");
      const sessionBody: unknown = await sessionResponse.json();
      const user = readUser(sessionBody);
      if (!sessionResponse.ok || !user) {
        setSessionUser(null);
        setStatus({ kind: "error", text: t("cookieFailed") });
        return;
      }

      const products = user.activeProducts.join(",") || t("none");
      setSessionUser(user);
      setStatus({
        kind: "ok",
        text: t("sessionConfirmed", {
          email: user.email,
          plan: user.plan,
          products,
        }),
      });
    } catch {
      setStatus({ kind: "error", text: t("network") });
    } finally {
      setPending(false);
    }
  }

  async function purchaseApp1(): Promise<void> {
    if (!sessionUser) {
      return;
    }

    setPending(true);
    setStatus({ kind: "idle" });
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionUser.userId,
          targetProduct: "app1",
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setStatus({ kind: "error", text: messageForStatus(response) });
        return;
      }

      const url = readCheckoutUrl(body);
      if (!url) {
        setStatus({ kind: "error", text: t("redirectMissing") });
        return;
      }

      window.location.assign(localizeDashboardUrl(url, locale));
    } catch {
      setStatus({ kind: "error", text: t("network") });
    } finally {
      setPending(false);
    }
  }

  const products = sessionUser ? sessionUser.activeProducts.join(",") || t("none") : "";

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-md border border-border/40 bg-card p-6">
        <h1 className="text-xl">{t("title")}</h1>
        <p className="mt-2 text-sm">{t("subtitle")}</p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
          <label className="flex flex-col gap-1 text-sm">
            {t("email")}
            <input
              className="border border-border/40 bg-background p-2 text-foreground"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("password")}
            <input
              className="border border-border/40 bg-background p-2 text-foreground"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              className="border border-border/40 bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              type="button"
              disabled={pending}
              onClick={() => {
                void submit("/api/auth/register");
              }}
            >
              {t("register")}
            </button>
            <button
              className="border border-border/40 bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              type="button"
              disabled={pending}
              onClick={() => {
                void submit("/api/auth/login");
              }}
            >
              {t("login")}
            </button>
          </div>
        </form>
        {sessionUser ? (
          <div className="mt-4 border border-border/40 p-3">
            <p className="text-sm">
              {t("account", {
                email: sessionUser.email,
                plan: sessionUser.plan,
                products,
              })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center border border-border/40 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                href="/dashboard"
              >
                {t("dashboard")}
              </Link>
              {sessionUser.role === "admin" ? (
                <Link
                  className="inline-flex items-center border border-border/40 bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                  href="/admin/settings"
                >
                  {t("settings")}
                </Link>
              ) : null}
              <button
                className="border border-border/40 bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                type="button"
                disabled={pending}
                onClick={() => {
                  void purchaseApp1();
                }}
              >
                {t("purchase")}
              </button>
            </div>
          </div>
        ) : null}
        {status.kind !== "idle" ? (
          <p className="mt-4 border border-border/40 bg-muted/40 p-2 text-sm">{status.text}</p>
        ) : null}
      </section>
    </main>
  );
}
