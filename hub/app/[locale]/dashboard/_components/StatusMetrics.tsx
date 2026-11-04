import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface StatusMetricsProps {
  plan: string;
  activeProducts: string[];
}

export async function StatusMetrics({ plan, activeProducts }: StatusMetricsProps) {
  const t = await getTranslations("dashboard");
  const planActive = plan.length > 0 && plan !== "free";
  const planName = plan === "free" ? t("plans.free") : plan === "pro" ? t("plans.pro") : plan;
  const productSummary =
    activeProducts.length > 0 ? activeProducts.join(", ") : t("metrics.productsEmpty");

  return (
    <section aria-label={t("metrics.heading")} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-lg border border-border/40 bg-card/60 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("metrics.planLabel")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{planName}</p>
          <span
            className={
              planActive
                ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {planActive ? t("metrics.active") : t("metrics.inactive")}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {planActive ? t("metrics.renewalPending") : t("metrics.renewalNone")}
        </p>
      </article>

      <article className="rounded-lg border border-border/40 bg-card/60 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("metrics.productsLabel")}
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {activeProducts.length}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{productSummary}</p>
      </article>

      <article className="rounded-lg border border-border/40 bg-card/60 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("metrics.securityLabel")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Mail className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-2xl font-semibold tracking-tight text-foreground">{t("metrics.authEmail")}</p>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {t("metrics.sessionBadge")}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t("metrics.sessionActive")}</p>
      </article>
    </section>
  );
}
