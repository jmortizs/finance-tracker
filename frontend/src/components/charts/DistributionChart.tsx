import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { NormalizedDistributionPoint } from "../../types/dashboard";
import { formatMoney, formatPercent } from "../../utils/format";

const COLORS = ["#FFFFFF", "#C5FF00", "#888888", "#A0A0A0", "#1C1C1C"];

interface DistributionChartProps {
  data: NormalizedDistributionPoint[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
      <div className="h-[280px] min-w-0">
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
                <Cell key={`${point.type}-${point.categoryName}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#000000", border: "1px solid #1C1C1C", color: "#FFFFFF" }}
              formatter={(value, _name, item) => {
                const payload = item.payload as NormalizedDistributionPoint;
                return [`${formatMoney(Number(value))} / ${formatPercent(payload.percentage)}`, payload.categoryName];
              }}
              labelStyle={{ color: "#C5FF00" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 overflow-x-auto border border-grid">
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
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {point.categoryName}
                </td>
                <td className="border-b border-grid px-3 py-3 text-right text-muted-strong">
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
