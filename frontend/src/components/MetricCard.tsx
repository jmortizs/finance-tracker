import type { NormalizedMetric } from "../types/dashboard";
import { formatMoney, formatPercent, formatSignedChange } from "../utils/format";

interface MetricCardProps {
  label: string;
  metric: NormalizedMetric | null;
  mode?: "money" | "percent";
  loading: boolean;
}

export function MetricCard({ label, metric, mode = "money", loading }: MetricCardProps) {
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
        <span className="border border-accent px-2 py-1 text-[10px] font-bold uppercase text-accent">
          {loading ? "LOAD" : "LIVE"}
        </span>
      </div>
      <p className="mt-5 break-words text-2xl font-bold text-ink">{loading ? "--" : value}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase text-muted">
        <span>Prev {loading ? "--" : previous}</span>
        <span className="text-accent">{loading ? "--" : formatSignedChange(metric?.changePercent ?? null)}</span>
      </div>
    </section>
  );
}
