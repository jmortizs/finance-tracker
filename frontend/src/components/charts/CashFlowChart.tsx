import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { NormalizedCashFlowPoint } from "../../types/dashboard";
import { formatMoney, formatMonth } from "../../utils/format";

interface CashFlowChartProps {
  data: NormalizedCashFlowPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
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
            formatter={(value, name) => [formatMoney(Number(value)), String(name)]}
            labelStyle={{ color: "#C5FF00" }}
          />
          <Line
            type="linear"
            dataKey="income"
            name="Income"
            stroke="#C5FF00"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="expenses"
            name="Expenses"
            stroke="#FF4D4D"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="netSavings"
            name="Cash flow"
            stroke="#FFFFFF"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
