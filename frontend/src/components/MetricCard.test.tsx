import { render, screen } from "@testing-library/react";

import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders money metrics with previous value and change context", () => {
    render(
      <MetricCard
        label="Income"
        loading={false}
        metric={{ value: 1200, previousValue: 1000, changePercent: 20 }}
      />
    );

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("$1,200.00")).toBeInTheDocument();
    expect(screen.getByText("Prev $1,000.00")).toBeInTheDocument();
    expect(screen.getByText("+20.00%")).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });

  it("renders loading placeholders", () => {
    render(<MetricCard label="Balance" loading metric={null} />);

    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.queryByText("LOAD")).not.toBeInTheDocument();
    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
  });

  it("renders expense values and context in red", () => {
    render(
      <MetricCard
        label="Expenses"
        loading={false}
        tone="expense"
        metric={{ value: 700, previousValue: 500, changePercent: 40 }}
      />
    );

    expect(screen.getByText("$700.00")).toHaveClass("text-danger");
    expect(screen.getByText("Prev $500.00")).toHaveClass("text-danger");
    expect(screen.getByText("+40.00%")).toHaveClass("text-danger");
  });

  it("renders balance reductions in red", () => {
    render(
      <MetricCard
        label="Balance"
        loading={false}
        tone="balance"
        metric={{ value: 1200, previousValue: 1500, changePercent: -20 }}
      />
    );

    expect(screen.getByText("-20.00%")).toHaveClass("text-danger");
  });
});
