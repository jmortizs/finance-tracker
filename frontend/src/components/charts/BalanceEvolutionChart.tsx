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
import { LineSeriesDot } from "./LineSeriesDot";

interface BalanceEvolutionChartProps {
  data: NormalizedBalancePoint[];
}

interface BalanceEvolutionChartPoint extends NormalizedBalancePoint {
  label: string;
  balanceChange: number | null;
}

interface BalanceDotProps {
  cx?: number;
  cy?: number;
  payload?: BalanceEvolutionChartPoint;
  r?: number;
}

export function BalanceDot({ cx, cy, payload, r = 3 }: BalanceDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  const isReduction = (payload?.balanceChange ?? 0) < 0;
  const stroke = isReduction ? "#FF4D4D" : "#C5FF00";

  return <LineSeriesDot cx={cx} cy={cy} r={r} stroke={stroke} />;
}

export function BalanceEvolutionChart({ data }: BalanceEvolutionChartProps) {
  const chartData = data.map((point, index): BalanceEvolutionChartPoint => ({
    ...point,
    label: formatMonth(point.month),
    balanceChange: index === 0 ? null : point.balance - data[index - 1].balance
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
            formatter={(value) => [formatMoney(Number(value)), "Closing balance"]}
            labelStyle={{ color: "#C5FF00" }}
          />
          <Line
            type="linear"
            dataKey="balance"
            stroke="#C5FF00"
            strokeWidth={2}
            dot={<BalanceDot />}
            activeDot={<BalanceDot r={4} />}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
