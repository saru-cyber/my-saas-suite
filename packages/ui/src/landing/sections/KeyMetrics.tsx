import type { LPMetric } from "../types";

export interface KeyMetricsProps {
  metrics: LPMetric[];
}

/** 3–4 headline numbers. 2×2 on mobile, one row from md up. */
export function KeyMetrics({ metrics }: KeyMetricsProps) {
  const columns = metrics.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="border-y border-border/40 bg-muted/20 py-8">
      <dl className={`mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 md:px-8 ${columns}`}>
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center gap-1 text-center">
            <dt className="order-2 text-xs text-muted-foreground">{metric.label}</dt>
            <dd className="order-1 text-3xl font-bold tracking-tight tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
