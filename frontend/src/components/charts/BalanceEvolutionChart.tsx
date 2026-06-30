import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { NormalizedBalancePoint } from "../../types/dashboard";
import { formatMoney, formatMonth } from "../../utils/format";

interface BalanceEvolutionChartProps {
  data: NormalizedBalancePoint[];
}

export function BalanceEvolutionChart({ data }: BalanceEvolutionChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatMonth(point.month)
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1C1C1C" strokeDasharray="0" />
          <XAxis dataKey="label" stroke="#888888" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            tickFormatter={(value) => formatMoney(Number(value))}
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <Tooltip
            contentStyle={{ background: "#000000", border: "1px solid #1C1C1C", color: "#FFFFFF" }}
            formatter={(value) => [formatMoney(Number(value)), "Balance"]}
            labelStyle={{ color: "#C5FF00" }}
          />
          <Line
            type="linear"
            dataKey="balance"
            stroke="#C5FF00"
            strokeWidth={2}
            dot={{ r: 3, stroke: "#C5FF00", fill: "#000000" }}
            activeDot={{ r: 4, stroke: "#FFFFFF", fill: "#C5FF00" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
