import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DistributionChart, DistributionTooltipContent } from "./DistributionChart";

vi.mock("recharts", () => ({
  Cell: (props: { fill: string }) => <div data-testid="cell" data-fill={props.fill} />,
  Pie: ({ children }: { children: ReactNode }) => <div data-testid="pie">{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: (props: { content?: ReactNode }) => <div data-testid="tooltip">{props.content}</div>
}));

describe("DistributionChart", () => {
  it("renders income distribution with leading slice in green", () => {
    render(
      <DistributionChart
        data={[
          {
            categoryId: 1,
            categoryName: "Salary",
            type: "INCOME",
            amount: 80,
            percentage: 80
          },
          {
            categoryId: 2,
            categoryName: "Freelance",
            type: "INCOME",
            amount: 20,
            percentage: 20
          }
        ]}
      />
    );

    expect(screen.getAllByTestId("cell")[0]).toHaveAttribute("data-fill", "#87E614");
  });

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

  it("renders legible tooltip content with category, amount, and share", () => {
    const { container } = render(
      <DistributionTooltipContent
        active
        payload={[
          {
            value: 150,
            payload: {
              categoryId: 3,
              categoryName: "Interest",
              type: "INCOME",
              amount: 150,
              percentage: 12.5
            }
          }
        ]}
      />
    );

    expect(screen.getByText("Interest")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("12.50%")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-canvas", "text-ink", "border-grid");
  });
});
