import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { BalanceDot, BalanceEvolutionChart } from "./BalanceEvolutionChart";

vi.mock("recharts", () => ({
  CartesianGrid: () => <div data-testid="grid" />,
  Line: (props: { dataKey: string }) => <div data-testid="line" data-key={props.dataKey} />,
  LineChart: ({ children }: { children: ReactNode }) => <div data-testid="line-chart">{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: (props: { formatter: (value: number) => [string, string] }) => {
    const [, label] = props.formatter(1550);
    return <div data-testid="tooltip-label">{label}</div>;
  },
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: (props: { tickFormatter?: (value: number) => string }) => (
    <div
      data-testid="y-axis"
      data-tick={props.tickFormatter ? props.tickFormatter(45251518.99) : ""}
    />
  )
}));

describe("BalanceEvolutionChart", () => {
  it("labels points as closing balances", () => {
    render(
      <BalanceEvolutionChart
        data={[
          { month: "2026-05-01", balance: 1650 },
          { month: "2026-06-01", balance: 1550 }
        ]}
      />
    );

    expect(screen.getByTestId("tooltip-label")).toHaveTextContent("Closing balance");
  });

  it("renders reduction dots in red", () => {
    const { container } = render(
      <svg>
        <BalanceDot cx={12} cy={24} payload={{ month: "2026-06-01", balance: 1550, label: "Jun 2026", balanceChange: -100 }} />
      </svg>
    );

    expect(container.querySelector('circle[stroke="#FF4D4D"]')).not.toBeNull();
  });

  it("uses compact labels for y-axis ticks", () => {
    render(
      <BalanceEvolutionChart
        data={[
          { month: "2026-05-01", balance: 1650 },
          { month: "2026-06-01", balance: 1550 }
        ]}
      />
    );

    const axisTick = screen.getByTestId("y-axis").getAttribute("data-tick");
    expect(axisTick).not.toBeNull();
    expect(axisTick ?? "").toContain("M");
  });
});
