import { render, screen } from "@testing-library/react";

import { ChartPanel, PanelState } from "./PanelState";

describe("PanelState", () => {
  it("renders a reusable state title and message", () => {
    render(<PanelState title="Empty" message="No rows returned." />);

    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("No rows returned.")).toBeInTheDocument();
  });
});

describe("ChartPanel", () => {
  it("renders children when data is successful and non-empty", () => {
    render(
      <ChartPanel title="Cash Flow" status="success" error={null} isEmpty={false}>
        <div>chart body</div>
      </ChartPanel>
    );

    expect(screen.getByText("Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("chart body")).toBeInTheDocument();
    expect(screen.queryByText("success")).not.toBeInTheDocument();
  });

  it("renders an empty state for successful empty data", () => {
    render(
      <ChartPanel title="Cash Flow" status="success" error={null} isEmpty>
        <div>chart body</div>
      </ChartPanel>
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.queryByText("chart body")).not.toBeInTheDocument();
    expect(screen.queryByText("success")).not.toBeInTheDocument();
  });

  it("preserves visible loading and error body states", () => {
    const { rerender } = render(
      <ChartPanel title="Cash Flow" status="loading" error={null} isEmpty={false}>
        <div>chart body</div>
      </ChartPanel>
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();

    rerender(
      <ChartPanel title="Cash Flow" status="error" error="Request failed" isEmpty={false}>
        <div>chart body</div>
      </ChartPanel>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Request failed")).toBeInTheDocument();
  });
});
