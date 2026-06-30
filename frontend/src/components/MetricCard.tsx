import type { NormalizedMetric } from "../types/dashboard";
import { formatMoney, formatPercent, formatSignedChange } from "../utils/format";

interface MetricCardProps {
  label: string;
  metric: NormalizedMetric | null;
  mode?: "money" | "percent";
  loading: boolean;
  tone?: "balance" | "income" | "expense" | "savings";
}

function valueClassName(tone: MetricCardProps["tone"], value: number | null): string {
  if (tone === "expense" || (value !== null && value < 0)) {
    return "text-danger";
  }

  return "text-ink";
}

function changeClassName(tone: MetricCardProps["tone"], changePercent: number | null): string {
  if (tone === "expense") {
    return "text-danger";
  }

  if (changePercent === null) {
    return "text-muted";
  }

  return changePercent < 0 ? "text-danger" : "text-accent";
}

export function MetricCard({
  label,
  metric,
  mode = "money",
  loading,
  tone = "balance"
}: MetricCardProps) {
  const value = metric
    ? mode === "percent"
      ? formatPercent(metric.value)
      : formatMoney(metric.value)
    : "--";
  const previous = metric
    ? mode === "percent"
      ? formatPercent(metric.previousValue)
      : formatMoney(metric.previousValue)
    : "--";

  return (
    <section className="min-h-[132px] border border-grid bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xs font-bold uppercase text-muted-strong">{label}</h2>
      </div>
      <p className={`mt-5 break-words text-2xl font-bold ${valueClassName(tone, metric?.value ?? null)}`}>
        {loading ? "--" : value}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase text-muted">
        <span className={valueClassName(tone, metric?.previousValue ?? null)}>
          Prev {loading ? "--" : previous}
        </span>
        <span className={changeClassName(tone, metric?.changePercent ?? null)}>
          {loading ? "--" : formatSignedChange(metric?.changePercent ?? null)}
        </span>
      </div>
    </section>
  );
}
