export type HeaderLocale = "en" | "ja";

export interface SuiteHeaderLabels {
  login: string;
  start: string;
  dashboard: string;
}

export const headerLabels: Record<HeaderLocale, SuiteHeaderLabels> = {
  ja: { login: "ログイン", start: "無料で始める", dashboard: "ダッシュボードを開く" },
  en: { login: "Log in", start: "Start for free", dashboard: "Open dashboard" },
};

export interface SuiteHeaderProps {
  /** Text next to the logo. Defaults to "my-saas-suite". */
  brandName?: string;
  /** http(s) logo image. When omitted only `brandName` is shown. */
  logoUrl?: string;
  currentLocale: HeaderLocale;
  /** Hub origin for sign-in. Defaults to NEXT_PUBLIC_HUB_URL, then http://localhost:3000. */
  hubUrl?: string;
  /** Where signed-in users go. Defaults to `/{locale}/dashboard` in the current app. */
  dashboardUrl?: string;
  /** Signed-in users see "Open dashboard" instead of "Log in" + "Start for free". */
  isLoggedIn?: boolean;
  /** Overrides individual built-in UI strings. */
  labels?: Partial<SuiteHeaderLabels>;
}

function resolveHubUrl(hubUrl?: string): string {
  const url = hubUrl || process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/** Shared sticky top bar for the Hub and every product. Sign-in always happens on the Hub. */
export function SuiteHeader({
  brandName = "my-saas-suite",
  logoUrl,
  currentLocale,
  hubUrl,
  dashboardUrl,
  isLoggedIn = false,
  labels,
}: SuiteHeaderProps) {
  const text = { ...headerLabels[currentLocale], ...labels };
  const loginUrl = `${resolveHubUrl(hubUrl)}/${currentLocale}/login`;
  const primaryAction = isLoggedIn
    ? { href: dashboardUrl ?? `/${currentLocale}/dashboard`, label: text.dashboard }
    : { href: loginUrl, label: text.start };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a href={`/${currentLocale}`} className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
          {logoUrl ? <img src={logoUrl} alt="" className="h-7 max-w-32 shrink-0 object-contain" /> : null}
          <span className="truncate">{brandName}</span>
        </a>
        <nav className="flex shrink-0 items-center gap-4">
          {isLoggedIn ? null : (
            <a href={loginUrl} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {text.login}
            </a>
          )}
          <a
            href={primaryAction.href}
            className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {primaryAction.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
