import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { SavingsGoalCard } from "./SavingsGoalCard";
import type { NormalizedSavingsGoal, ResourceState } from "../types/dashboard";

const configuredGoal: ResourceState<NormalizedSavingsGoal | null> = {
  status: "success",
  data: {
    id: 1,
    targetAmount: 2000,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    progress: 500,
    completionPercentage: 25
  },
  error: null
};

describe("SavingsGoalCard", () => {
  it("renders target, completion percentage, and deadline", () => {
    render(<SavingsGoalCard goal={configuredGoal} onSave={vi.fn()} />);

    expect(screen.getByText("$2,000.00")).toBeInTheDocument();
    expect(screen.getByText("25.00%")).toBeInTheDocument();
    expect(screen.getByText("2026-06-30")).toBeInTheDocument();
    expect(screen.getByText("Progress $500.00")).toBeInTheDocument();
  });

  it("saves inline edits without navigation", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<SavingsGoalCard goal={configuredGoal} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Target amount"));
    await user.type(screen.getByLabelText("Target amount"), "3000");
    await user.clear(screen.getByLabelText("Start date"));
    await user.type(screen.getByLabelText("Start date"), "2026-05-01");
    await user.clear(screen.getByLabelText("Deadline"));
    await user.type(screen.getByLabelText("Deadline"), "2026-12-31");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith({
      target_amount: "3000",
      start_date: "2026-05-01",
      end_date: "2026-12-31"
    });
  });
});
