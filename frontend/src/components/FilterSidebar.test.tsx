import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { uploadStatement } from "../api/dashboard";
import { FilterSidebar } from "./FilterSidebar";

vi.mock("../api/dashboard", () => ({
  uploadStatement: vi.fn()
}));

const uploadStatementMock = vi.mocked(uploadStatement);

function renderSidebar(onRefresh = vi.fn()) {
  render(
    <FilterSidebar
      filters={{ startDate: "", endDate: "", bankId: null, accountId: null }}
      options={{
        status: "success",
        data: { banks: [], accounts: [], min_transaction_date: null, max_transaction_date: null },
        error: null
      }}
      availableAccounts={[]}
      onChange={vi.fn()}
      onReset={vi.fn()}
      onRefresh={onRefresh}
      onOpenCreditCards={vi.fn()}
    />
  );
}

describe("FilterSidebar statement upload", () => {
  it("renders the PDF upload widget above Reset and Refresh", () => {
    renderSidebar();

    const uploadRegion = screen.getByLabelText("Statement PDF upload");
    const resetButton = screen.getByRole("button", { name: /reset/i });
    const refreshButton = screen.getByRole("button", { name: /refresh/i });

    expect(uploadRegion.compareDocumentPosition(resetButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(uploadRegion.compareDocumentPosition(refreshButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getByLabelText("Bank statement PDF")).toHaveAttribute("accept", "application/pdf,.pdf");
  });

  it("uploads one PDF, shows status, and refreshes dashboard data", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    uploadStatementMock.mockResolvedValue({
      statement_id: 1,
      file_name: "statement.pdf",
      file_hash: "abc",
      bank_id: 1,
      account_id: 1,
      inserted_transactions: 2,
      skipped_transactions: 1
    });
    renderSidebar(onRefresh);

    await user.upload(
      screen.getByLabelText("Bank statement PDF"),
      new File(["pdf"], "statement.pdf", { type: "application/pdf" })
    );

    expect(await screen.findByText("Inserted 2; skipped 1.")).toBeInTheDocument();
    expect(uploadStatementMock).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
