import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { CreditCardDashboard } from "./CreditCardDashboard";

vi.mock("../hooks/useCreditCardDashboard", () => ({
  useCreditCardDashboard: () => ({
    refresh: vi.fn(),
    metrics: {
      status: "success",
      data: {
        currentStatementBalance: 300,
        creditUtilization: 30,
        availableCredit: 700,
        weightedApr: 24,
        activePlans: 1
      },
      error: null
    },
    activity: { status: "success", data: [], error: null },
    distribution: { status: "success", data: [], error: null },
    items: {
      status: "success",
      data: [
        {
          id: 1,
          transactionDate: "2026-06-01",
          description: "Market",
          category: "groceries",
          kind: "purchase",
          amount: 100,
          installmentNumber: 2,
          installmentTotal: 24,
          remainingAmount: 2200
        },
        {
          id: 2,
          transactionDate: "2026-06-02",
          description: "Payment",
          category: "others",
          kind: "payment",
          amount: -50,
          installmentNumber: null,
          installmentTotal: null,
          remainingAmount: null
        }
      ],
      error: null
    }
  })
}));

describe("CreditCardDashboard", () => {
  it("renders installment obligations and payment color semantics", () => {
    render(<CreditCardDashboard onBack={vi.fn()} />);

    expect(screen.getByText("2/24")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toHaveClass("text-danger");
    expect(screen.getByText("-$50.00")).toHaveClass("text-accent");
  });
});
