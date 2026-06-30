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
  });

  it("renders loading placeholders", () => {
    render(<MetricCard label="Balance" loading metric={null} />);

    expect(screen.getByText("LOAD")).toBeInTheDocument();
    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
  });
});
