import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { CashFlowChart } from "./CashFlowChart";

vi.mock("recharts", () => ({
  CartesianGrid: () => <div data-testid="grid" />,
  Line: (props: {
    dataKey: string;
    name: string;
    stroke: string;
    type: string;
    dot: unknown;
    activeDot: unknown;
  }) => (
    <div
      data-testid="line"
      data-key={props.dataKey}
      data-name={props.name}
      data-stroke={props.stroke}
      data-type={props.type}
      data-dot={String(Boolean(props.dot))}
      data-active-dot={String(Boolean(props.activeDot))}
    />
  ),
  LineChart: ({ children }: { children: ReactNode }) => <div data-testid="line-chart">{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: (props: { tickFormatter?: (value: number) => string }) => (
    <div
      data-testid="y-axis"
      data-tick={props.tickFormatter ? props.tickFormatter(45251518.99) : ""}
    />
  )
}));

describe("CashFlowChart", () => {
  it("renders income, expenses, and cash flow as configured linear lines", () => {
    render(
      <CashFlowChart
        data={[
          {
            month: "2026-05-01",
            income: 1200,
            expenses: -300,
            netSavings: 900
          }
        ]}
      />
    );

    const lines = screen.getAllByTestId("line");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveAttribute("data-key", "income");
    expect(lines[0]).toHaveAttribute("data-name", "Income");
    expect(lines[0]).toHaveAttribute("data-stroke", "#C5FF00");
    expect(lines[0]).toHaveAttribute("data-type", "linear");
    expect(lines[0]).toHaveAttribute("data-dot", "true");
    expect(lines[0]).toHaveAttribute("data-active-dot", "true");
    expect(lines[1]).toHaveAttribute("data-key", "expenses");
    expect(lines[1]).toHaveAttribute("data-name", "Expenses");
    expect(lines[1]).toHaveAttribute("data-stroke", "#FF4D4D");
    expect(lines[1]).toHaveAttribute("data-type", "linear");
    expect(lines[1]).toHaveAttribute("data-dot", "true");
    expect(lines[1]).toHaveAttribute("data-active-dot", "true");
    expect(lines[2]).toHaveAttribute("data-key", "netSavings");
    expect(lines[2]).toHaveAttribute("data-name", "Cash flow");
    expect(lines[2]).toHaveAttribute("data-stroke", "#FFFFFF");
    expect(lines[2]).toHaveAttribute("data-type", "linear");
    expect(lines[2]).toHaveAttribute("data-dot", "true");
    expect(lines[2]).toHaveAttribute("data-active-dot", "true");

    const axisTick = screen.getByTestId("y-axis").getAttribute("data-tick");
    expect(axisTick).not.toBeNull();
    expect(axisTick ?? "").toContain("M");
  });
});
