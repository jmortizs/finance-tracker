import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DistributionChart } from "./DistributionChart";

vi.mock("recharts", () => ({
  Cell: (props: { fill: string }) => <div data-testid="cell" data-fill={props.fill} />,
  Pie: ({ children }: { children: ReactNode }) => <div data-testid="pie">{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />
}));

describe("DistributionChart", () => {
  it("renders expense distribution amounts and leading slice in red", () => {
    render(
      <DistributionChart
        data={[
          {
            categoryId: 1,
            categoryName: "Groceries",
            type: "EXPENSE",
            amount: 75,
            percentage: 75
          },
          {
            categoryId: 2,
            categoryName: "Transport",
            type: "EXPENSE",
            amount: 25,
            percentage: 25
          }
        ]}
      />
    );

    expect(screen.getByText("$75.00")).toHaveClass("text-danger");
    expect(screen.getAllByTestId("cell")[0]).toHaveAttribute("data-fill", "#FF4D4D");
  });
});
