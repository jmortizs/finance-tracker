import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { NormalizedDistributionPoint } from "../../types/dashboard";
import { formatMoney, formatPercent } from "../../utils/format";

const INCOME_COLORS = ["#87E614", "#FFFFFF", "#888888", "#A0A0A0", "#1C1C1C"];
const EXPENSE_COLORS = ["#FF4D4D", "#FFFFFF", "#888888", "#A0A0A0", "#1C1C1C"];

function getSliceColor(point: NormalizedDistributionPoint, index: number): string {
  const palette = point.type === "EXPENSE" ? EXPENSE_COLORS : INCOME_COLORS;
  return palette[index % palette.length];
}

interface DistributionTooltipEntry {
  payload?: NormalizedDistributionPoint;
  value?: number | string;
}

interface DistributionTooltipContentProps {
  active?: boolean;
  payload?: DistributionTooltipEntry[];
}

export function DistributionTooltipContent({ active, payload }: DistributionTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const firstPayload = payload[0];
  const point = firstPayload.payload;

  if (!point) {
    return null;
  }

  const categoryName = point.categoryName.trim() || "Uncategorized";
  const amount = typeof firstPayload.value === "number" || typeof firstPayload.value === "string"
    ? Number(firstPayload.value)
    : point.amount;

  const categoryColorClass = point.type === "EXPENSE" ? "text-danger" : "text-accent";

  return (
    <div className="border border-grid bg-canvas px-2 py-1.5 text-xs uppercase text-ink">
      <div className={categoryColorClass}>{categoryName}</div>
      <div className="text-ink">{formatMoney(amount)}</div>
      <div className="text-muted">{formatPercent(point.percentage)}</div>
    </div>
  );
}

interface DistributionChartProps {
  data: NormalizedDistributionPoint[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)] xl:grid-rows-[minmax(0,1fr)]">
      <div className="h-[280px] min-w-0 lg:h-full lg:min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="categoryName"
              innerRadius="74%"
              outerRadius="92%"
              paddingAngle={0}
              stroke="#000000"
              strokeWidth={1}
              isAnimationActive={false}
            >
              {data.map((point, index) => (
                <Cell key={`${point.type}-${point.categoryName}`} fill={getSliceColor(point, index)} />
              ))}
            </Pie>
            <Tooltip content={<DistributionTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 overflow-x-auto border border-grid lg:min-h-0 lg:overflow-y-auto">
        <table className="w-full min-w-[360px] border-collapse text-left text-xs uppercase">
          <thead className="text-muted">
            <tr>
              <th className="border-b border-grid px-3 py-3">Category</th>
              <th className="border-b border-grid px-3 py-3 text-right">Amount</th>
              <th className="border-b border-grid px-3 py-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, index) => (
              <tr key={`${point.type}-${point.categoryName}-${point.categoryId ?? "none"}`}>
                <td className="border-b border-grid px-3 py-3 text-ink">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 align-middle"
                    style={{ backgroundColor: getSliceColor(point, index) }}
                  />
                  {point.categoryName}
                </td>
                <td
                  className={`border-b border-grid px-3 py-3 text-right ${
                    point.type === "EXPENSE" ? "text-danger" : "text-muted-strong"
                  }`}
                >
                  {formatMoney(point.amount)}
                </td>
                <td className="border-b border-grid px-3 py-3 text-right text-accent">
                  {formatPercent(point.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
